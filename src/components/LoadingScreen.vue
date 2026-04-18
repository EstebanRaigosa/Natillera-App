<template>
  <Transition name="loading-fade">
    <div
      v-if="visible"
      :class="['loading-screen', `loading-screen--v${variant}`]"
      role="status"
      aria-live="polite"
      aria-label="Cargando"
    >
      <!-- Background + capas decorativas por variante -->
      <div class="loading-screen__bg" aria-hidden="true" />
      <div :class="['loading-screen__glow', `loading-screen__glow--v${variant}`]" aria-hidden="true" />

      <!-- Content -->
      <div class="loading-screen__content">
        <!-- Isotipo: misma animación de giro en todas las variantes -->
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

        <div class="loading-screen__block">
          <div class="loading-screen__brand">
            <h1 class="loading-screen__title">
              <AppBrand class="text-white" />
            </h1>
            <p class="loading-screen__subtitle">{{ variantSubtitle }}</p>
          </div>

          <div :class="['loading-screen__progress', `loading-screen__progress--v${variant}`]">
            <div class="loading-screen__progress-track">
              <div class="loading-screen__progress-bar" />
            </div>
          </div>

          <p class="loading-screen__text">
            {{ loadingText }}
          </p>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import AppBrand from './AppBrand.vue'
import logoIconSrc from '../../assets/logo_icon.png'

const VARIANT_COUNT = 3

/** Solo fondos y copy secundario por variante; marca siempre blanca (sobrio) */
const VARIANT_COPY = [
  { subtitle: 'Ahorro comunitario', loadingLine: 'Cargando' },
  { subtitle: 'Gestión colaborativa', loadingLine: 'Cargando' },
  { subtitle: 'Información actualizada', loadingLine: 'Cargando' }
]

const props = defineProps({
  visible: { type: Boolean, default: true },
  text: { type: String, default: '' }
})

/** 0, 1 o 2: se elige al azar cada vez que la pantalla se muestra */
const variant = ref(0)

const variantSubtitle = computed(() => VARIANT_COPY[variant.value]?.subtitle ?? VARIANT_COPY[0].subtitle)

function pickVariant() {
  variant.value = Math.floor(Math.random() * VARIANT_COUNT)
}

watch(
  () => props.visible,
  (v) => {
    if (v) pickVariant()
  },
  { immediate: true }
)

const dotCount = ref(0)
let dotInterval = null

const loadingText = computed(() => {
  if (props.text) return props.text
  const line = VARIANT_COPY[variant.value]?.loadingLine ?? 'Cargando'
  const dots = '.'.repeat(dotCount.value)
  return `${line}${dots}`
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
  height: -webkit-fill-available;
  -webkit-overflow-scrolling: touch;
}

.loading-screen__bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 95% 55% at 50% -15%, hsla(152, 40%, 20%, 0.38) 0%, transparent 52%),
    radial-gradient(ellipse 70% 45% at 80% 100%, hsla(160, 32%, 16%, 0.28) 0%, transparent 50%),
    linear-gradient(
      168deg,
      hsl(152 38% 10%) 0%,
      hsl(152 34% 13%) 38%,
      hsl(155 36% 11%) 72%,
      hsl(152 40% 9%) 100%
    );
}

/* Variante 1: noche océano / aurora fría (muy distinta al verde clásico) */
.loading-screen--v1 .loading-screen__bg {
  background:
    radial-gradient(ellipse 100% 70% at 0% 100%, hsla(200, 45%, 22%, 0.38) 0%, transparent 48%),
    radial-gradient(ellipse 80% 60% at 100% 0%, hsla(185, 38%, 18%, 0.32) 0%, transparent 50%),
    linear-gradient(
      128deg,
      hsl(205 42% 10%) 0%,
      hsl(198 38% 11%) 32%,
      hsl(185 36% 11%) 65%,
      hsl(175 40% 10%) 100%
    );
}

/* Variante 2: anochecer dorado: acentos ámbar sobre verde profundo */
.loading-screen--v2 .loading-screen__bg {
  background:
    radial-gradient(ellipse 110% 65% at 95% 95%, hsla(38, 45%, 28%, 0.32) 0%, transparent 52%),
    radial-gradient(circle at 10% 90%, hsla(32, 38%, 22%, 0.28) 0%, transparent 42%),
    radial-gradient(circle at 50% 15%, hsla(152, 32%, 18%, 0.2) 0%, transparent 45%),
    linear-gradient(
      198deg,
      hsl(152 38% 9%) 0%,
      hsl(148 36% 10%) 45%,
      hsl(152 40% 8%) 100%
    );
}

/* Orbes difuminados encima del fondo (refuerzan el mood de cada variante) */
.loading-screen__glow {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.loading-screen__glow::before,
.loading-screen__glow::after {
  content: '';
  position: absolute;
  border-radius: 50%;
  filter: blur(72px);
  opacity: 0.28;
}

.loading-screen__glow--v0::before {
  width: min(85vw, 24rem);
  height: min(85vw, 24rem);
  top: -12%;
  left: 50%;
  transform: translateX(-50%);
  background: radial-gradient(circle, hsla(152, 55%, 32%, 0.5) 0%, transparent 70%);
}

.loading-screen__glow--v0::after {
  width: min(70vw, 18rem);
  height: min(70vw, 18rem);
  bottom: -8%;
  right: -10%;
  background: radial-gradient(circle, hsla(168, 45%, 28%, 0.4) 0%, transparent 70%);
}

.loading-screen__glow--v1::before {
  width: min(90vw, 26rem);
  height: min(90vw, 26rem);
  top: 20%;
  left: -25%;
  background: radial-gradient(circle, hsla(190, 70%, 38%, 0.35) 0%, transparent 65%);
}

.loading-screen__glow--v1::after {
  width: min(75vw, 20rem);
  height: min(75vw, 20rem);
  bottom: 5%;
  right: -15%;
  background: radial-gradient(circle, hsla(165, 60%, 35%, 0.32) 0%, transparent 65%);
}

.loading-screen__glow--v2::before {
  width: min(100vw, 28rem);
  height: min(100vw, 28rem);
  bottom: -15%;
  right: -20%;
  background: radial-gradient(circle, hsla(42, 85%, 42%, 0.28) 0%, transparent 68%);
}

.loading-screen__glow--v2::after {
  width: min(55vw, 14rem);
  height: min(55vw, 14rem);
  top: 8%;
  left: 5%;
  background: radial-gradient(circle, hsla(152, 50%, 28%, 0.35) 0%, transparent 70%);
}

.loading-screen__content {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding: 2rem 1.5rem;
  text-align: center;
  max-width: 20rem;
  width: 100%;
  margin: 0 auto;
}

.loading-screen__block {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.125rem;
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

.loading-screen__brand {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.loading-screen__title {
  margin: 0;
  line-height: 1.2;
  font-size: clamp(1.625rem, 4.8vw, 1.875rem);
  font-weight: 700;
  letter-spacing: -0.02em;
}

.loading-screen__title :deep(span) {
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.45);
}

.loading-screen__subtitle {
  margin: 0;
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.06em;
  color: hsla(152, 25%, 88%, 0.72);
  line-height: 1.35;
}

.loading-screen--v1 .loading-screen__subtitle {
  color: hsla(200, 20%, 88%, 0.72);
}

.loading-screen--v2 .loading-screen__subtitle {
  color: hsla(45, 18%, 88%, 0.72);
}

/* Progress bar */
.loading-screen__progress {
  width: 100%;
  max-width: 200px;
  margin: 0;
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
  background: hsl(152, 45%, 52%);
  animation: loading-progress 1.8s ease-in-out infinite;
}

.loading-screen__progress--v1 .loading-screen__progress-track {
  height: 3px;
  background: hsla(200, 30%, 28%, 0.35);
}

.loading-screen__progress--v1 .loading-screen__progress-bar {
  width: 42%;
  background: hsl(195, 40%, 52%);
  animation: loading-progress-v1 2s cubic-bezier(0.45, 0, 0.55, 1) infinite;
}

@keyframes loading-progress-v1 {
  0% {
    transform: translateX(-110%);
  }
  100% {
    transform: translateX(280%);
  }
}

.loading-screen__progress--v2 .loading-screen__progress-track {
  background: hsla(40, 28%, 28%, 0.32);
}

.loading-screen__progress--v2 .loading-screen__progress-bar {
  width: 38%;
  background: hsl(43, 38%, 54%);
  animation: loading-progress 2.2s ease-in-out infinite;
}

.loading-screen__text {
  margin: 0;
  font-size: 0.8125rem;
  font-weight: 500;
  letter-spacing: 0.02em;
  font-variant-numeric: tabular-nums;
  min-width: 7rem;
  color: hsla(152, 15%, 92%, 0.75);
  font-family: var(--font-sans, system-ui, sans-serif);
}

.loading-screen--v1 .loading-screen__text {
  color: hsla(200, 12%, 90%, 0.75);
}

.loading-screen--v2 .loading-screen__text {
  color: hsla(45, 12%, 90%, 0.75);
}

/* Animations */
@keyframes loading-progress {
  0% { transform: translateX(-100%); }
  50% { transform: translateX(150%); }
  100% { transform: translateX(150%); }
}

/* Fade out transition: sin capturar toques mientras la opacidad baja (evita “clics muertos” tras login/carga) */
.loading-fade-leave-active {
  transition: opacity 0.5s ease-out;
  pointer-events: none;
}

.loading-fade-leave-to {
  opacity: 0;
  pointer-events: none;
}

/* iOS Safari: cubrir viewport real incluyendo safe areas (notch / home indicator) */
@supports (-webkit-touch-callout: none) {
  .loading-screen {
    min-height: 100vh;
    min-height: 100dvh;
    min-height: -webkit-fill-available;
    height: 100vh;
    height: 100dvh;
    height: -webkit-fill-available;
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

  .loading-screen__progress--v1 .loading-screen__progress-bar {
    animation: none;
  }
}
</style>

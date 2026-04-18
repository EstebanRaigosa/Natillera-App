<template>
  <!-- Modo flotante: centrado con overlay opcional -->
  <Teleport to="body" :disabled="inline">
    <Transition name="loading-box-fade">
      <div
        v-if="visible"
        :class="[
          'loading-box-root',
          inline ? 'loading-box-root--inline' : 'loading-box-root--fixed',
          { 'loading-box-root--no-backdrop': !backdrop && !inline }
        ]"
        @touchmove="onFixedTouchMove"
      >
        <div
          v-if="!inline && backdrop"
          :class="['loading-box__backdrop', backdropClass]"
          aria-hidden="true"
          @click.stop.prevent
          @touchmove.stop.prevent
        />
        <div
          :class="['loading-box__panel', panelClass]"
          role="status"
          aria-live="polite"
          :aria-label="ariaLabel"
        >
          <p v-if="isLg" class="loading-box__eyebrow">Natillerapp</p>
          <div
            :class="[
              'loading-box__logo-wrap',
              { 'loading-box__logo-wrap--md': isMd },
              { 'loading-box__logo-wrap--lg': isLg }
            ]"
          >
            <img
              :src="logoIconSrc"
              alt=""
              class="loading-box__logo"
              :width="logoSize"
              :height="logoSize"
              decoding="async"
              draggable="false"
            />
          </div>
          <p :class="['loading-box__text', textClass]">{{ displayText }}</p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import logoIconSrc from '../../assets/logo_icon.png'

const props = defineProps({
  /** Muestra u oculta el recuadro */
  visible: { type: Boolean, default: true },
  /** Texto fijo; si va vacío se usa “Cargando” con puntos animados */
  text: { type: String, default: '' },
  /** Solo el panel, sin overlay ni posición fija (para colocarlo dentro de un layout) */
  inline: { type: Boolean, default: false },
  /** Oscurece el fondo cuando no es inline */
  backdrop: { type: Boolean, default: true },
  ariaLabel: { type: String, default: 'Cargando' },
  /**
   * default: recuadro compacto, logo pequeño.
   * md: mismo panel compacto que default, logo notablemente más grande.
   * lg: panel amplio, icono grande y fondo más oscuro (p. ej. reenvío de comprobante).
   */
  size: {
    type: String,
    default: 'default',
    validator: (v) => ['default', 'md', 'lg'].includes(v)
  }
})

const isLg = computed(() => props.size === 'lg')
const isMd = computed(() => props.size === 'md')
const logoSize = computed(() => {
  if (isLg.value) return 128
  if (isMd.value) return 72
  return 40
})
const backdropClass = computed(() => (isLg.value ? 'loading-box__backdrop--lg' : ''))
const panelClass = computed(() => (isLg.value ? 'loading-box__panel--lg' : ''))
const textClass = computed(() => (isLg.value ? 'loading-box__text--lg' : ''))

const dotCount = ref(0)
let dotInterval = null

/** iOS Safari: evita scroll del documento detrás del overlay fijo */
function onFixedTouchMove(e) {
  if (!props.inline) e.preventDefault()
}

const displayText = computed(() => {
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
.loading-box-root--fixed {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  z-index: 9998;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  box-sizing: border-box;
  touch-action: none;
  overscroll-behavior: none;
  -webkit-overflow-scrolling: touch;
  -webkit-transform: translate3d(0, 0, 0);
  transform: translate3d(0, 0, 0);
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  /* padding + safe area (notch / home indicator) */
  padding: max(1rem, env(safe-area-inset-top, 0px)) max(1rem, env(safe-area-inset-right, 0px))
    max(1rem, env(safe-area-inset-bottom, 0px)) max(1rem, env(safe-area-inset-left, 0px));
}

.loading-box-root--fixed.loading-box-root--no-backdrop {
  pointer-events: none;
}

.loading-box-root--fixed.loading-box-root--no-backdrop .loading-box__panel {
  pointer-events: auto;
}

.loading-box__backdrop {
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.42);
}

.loading-box__backdrop--lg {
  background: rgba(10, 38, 28, 0.58);
  -webkit-backdrop-filter: blur(3px);
  backdrop-filter: blur(3px);
}

.loading-box-root--inline {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.loading-box__panel {
  position: relative;
  z-index: 1;
  isolation: isolate;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  min-width: 10rem;
  max-width: min(16rem, calc(100vw - 2rem));
  padding: 1rem 1.125rem;
  border-radius: 0.75rem;
  background: hsl(0 0% 100%);
  border: 1px solid hsl(220 13% 91%);
  box-shadow:
    0 4px 6px -1px rgba(15, 23, 42, 0.08),
    0 10px 24px -4px rgba(15, 23, 42, 0.12);
  -webkit-transform: translateZ(0);
  transform: translateZ(0);
}

.loading-box__panel--lg {
  min-width: min(18rem, calc(100vw - 2rem));
  max-width: min(28rem, calc(100vw - 1.25rem));
  padding: 1.75rem 2.25rem 2.125rem;
  gap: 1.125rem;
  border-radius: 1.125rem;
  overflow: hidden;
  background: linear-gradient(
    168deg,
    hsl(152 36% 91%) 0%,
    hsl(152 32% 94%) 28%,
    hsl(155 28% 97%) 55%,
    hsl(152 38% 93%) 100%
  );
  border: 1px solid hsl(152 30% 68%);
  box-shadow:
    inset 0 1px 0 hsla(0, 0%, 100%, 0.65),
    0 0 0 1px hsla(152, 40%, 38%, 0.12),
    0 14px 32px -8px hsla(152, 45%, 22%, 0.22),
    0 28px 56px -16px rgba(15, 23, 42, 0.12);
}

.loading-box__panel--lg::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 0;
  height: 4px;
  background: linear-gradient(
    90deg,
    hsl(152 42% 42%) 0%,
    hsl(155 48% 48%) 35%,
    hsl(152 52% 44%) 70%,
    hsl(160 40% 40%) 100%
  );
  pointer-events: none;
}

.loading-box__panel--lg > * {
  position: relative;
  z-index: 1;
}

.loading-box__eyebrow {
  margin: 0 0 -0.25rem;
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: hsl(152 22% 38%);
  opacity: 0.88;
  text-align: center;
  font-family: var(--font-sans, system-ui, sans-serif);
}

.loading-box__logo-wrap {
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  animation: loading-box-spin 1.1s linear infinite;
  -webkit-animation: loading-box-spin 1.1s linear infinite;
  will-change: transform;
}

/* Logo intermedio: panel sigue siendo el compacto (default) */
.loading-box__logo-wrap.loading-box__logo-wrap--md {
  width: 4.5rem;
  height: 4.5rem;
  min-width: 4.5rem;
  min-height: 4.5rem;
}

/* Dos clases = mayor especificidad; además va después del tamaño compacto */
.loading-box__logo-wrap.loading-box__logo-wrap--lg {
  width: 8rem;
  height: 8rem;
  min-width: 8rem;
  min-height: 8rem;
  padding: 0.625rem;
  box-sizing: border-box;
  border-radius: 50%;
  background: linear-gradient(
    155deg,
    hsl(152 42% 97%) 0%,
    hsl(0 0% 100%) 45%,
    hsl(152 36% 94%) 100%
  );
  box-shadow:
    0 0 0 1px hsl(152 28% 72%),
    0 0 0 5px hsla(152, 40%, 45%, 0.1),
    0 8px 20px -4px hsla(152, 45%, 28%, 0.25),
    inset 0 2px 3px hsla(0, 0%, 100%, 0.95);
}

.loading-box__logo {
  width: 100%;
  height: 100%;
  object-fit: contain;
  pointer-events: none;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
}

@keyframes loading-box-spin {
  from {
    transform: translate3d(0, 0, 0) rotate(0deg);
  }
  to {
    transform: translate3d(0, 0, 0) rotate(360deg);
  }
}

@-webkit-keyframes loading-box-spin {
  from {
    -webkit-transform: translate3d(0, 0, 0) rotate(0deg);
    transform: translate3d(0, 0, 0) rotate(0deg);
  }
  to {
    -webkit-transform: translate3d(0, 0, 0) rotate(360deg);
    transform: translate3d(0, 0, 0) rotate(360deg);
  }
}

.loading-box__text {
  margin: 0;
  font-size: 0.8125rem;
  font-weight: 500;
  color: hsl(220 9% 35%);
  text-align: center;
  line-height: 1.35;
  font-family: var(--font-sans, system-ui, sans-serif);
}

.loading-box__text--lg {
  margin-top: 0.125rem;
  font-size: 1rem;
  font-weight: 500;
  letter-spacing: 0.02em;
  color: hsl(152 24% 22%);
  line-height: 1.55;
  max-width: min(28ch, 100%);
}

.loading-box-fade-enter-active,
.loading-box-fade-leave-active {
  transition: opacity 0.2s ease;
}

.loading-box-fade-enter-from,
.loading-box-fade-leave-to {
  opacity: 0;
}

/* iOS Safari / WebKit: altura real del viewport (barra de direcciones, notch) */
@supports (-webkit-touch-callout: none) {
  .loading-box-root--fixed {
    min-height: 100vh;
    min-height: 100dvh;
    min-height: -webkit-fill-available;
    height: 100vh;
    height: 100dvh;
    height: -webkit-fill-available;
  }
}

@media (prefers-reduced-motion: reduce) {
  .loading-box__logo-wrap {
    animation: none;
    -webkit-animation: none;
    will-change: auto;
  }

  .loading-box__backdrop--lg {
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
  }
}
</style>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="show"
        class="loading-screen-ios"
        role="status"
        aria-live="polite"
        aria-label="Cargando"
        @click.stop.prevent
        @touchmove.stop.prevent
        @scroll.stop.prevent
      >
        <div class="loading-screen-ios__inner">
          <!-- Spinner simple: un solo anillo para máximo rendimiento en Safari -->
          <div class="loading-screen-ios__spinner" aria-hidden="true"></div>
          <p v-if="title" class="loading-screen-ios__title">{{ title }}</p>
          <p v-if="message" class="loading-screen-ios__message">{{ message }}</p>
          <div v-if="title || message" class="loading-screen-ios__dots" aria-hidden="true">
            <span></span><span></span><span></span>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
defineProps({
  show: { type: Boolean, default: true },
  title: { type: String, default: '' },
  message: { type: String, default: '' }
})
</script>

<style scoped>
/* Pantalla de carga exclusiva para iPhone/Safari. Diseño desde cero, sin afectar Android. */

.loading-screen-ios {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  width: 100vw !important;
  min-height: 100vh !important;
  min-height: 100dvh !important;
  min-height: -webkit-fill-available !important;
  height: 100vh !important;
  height: 100dvh !important;
  height: -webkit-fill-available !important;
  margin: 0 !important;
  padding: 0 !important;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 40%, #f0fdfa 100%);
  touch-action: none;
  overscroll-behavior: none;
  -webkit-overflow-scrolling: touch;
  /* Safe area para notch y home indicator */
  padding-left: env(safe-area-inset-left, 0);
  padding-right: env(safe-area-inset-right, 0);
  padding-bottom: env(safe-area-inset-bottom, 0);
  padding-top: env(safe-area-inset-top, 0);
  box-sizing: border-box;
  -webkit-transform: translate3d(0, 0, 0);
  transform: translate3d(0, 0, 0);
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
}

.loading-screen-ios__inner {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  max-width: 100%;
}

/* Spinner: un anillo que gira. Animación simple que Safari renderiza bien. */
.loading-screen-ios__spinner {
  width: 56px;
  height: 56px;
  border: 4px solid rgba(16, 185, 129, 0.25);
  border-top-color: #10b981;
  border-radius: 50%;
  -webkit-animation: loading-ios-spin 0.9s linear infinite;
  animation: loading-ios-spin 0.9s linear infinite;
  margin-bottom: 1.25rem;
}

@-webkit-keyframes loading-ios-spin {
  to { -webkit-transform: rotate(360deg); transform: rotate(360deg); }
}

@keyframes loading-ios-spin {
  to { transform: rotate(360deg); }
}

.loading-screen-ios__title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.25rem 0;
  text-align: center;
}

.loading-screen-ios__message {
  font-size: 0.9375rem;
  color: #6b7280;
  margin: 0;
  text-align: center;
}

.loading-screen-ios__dots {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  margin-top: 0.75rem;
}

.loading-screen-ios__dots span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #10b981;
  -webkit-animation: loading-ios-bounce 1.2s ease-in-out infinite both;
  animation: loading-ios-bounce 1.2s ease-in-out infinite both;
}

.loading-screen-ios__dots span:nth-child(1) { animation-delay: 0s; }
.loading-screen-ios__dots span:nth-child(2) { animation-delay: 0.15s; }
.loading-screen-ios__dots span:nth-child(3) { animation-delay: 0.3s; }

@-webkit-keyframes loading-ios-bounce {
  0%, 80%, 100% { -webkit-transform: scale(0.85); transform: scale(0.85); opacity: 0.6; }
  40% { -webkit-transform: scale(1.2); transform: scale(1.2); opacity: 1; }
}

@keyframes loading-ios-bounce {
  0%, 80%, 100% { transform: scale(0.85); opacity: 0.6; }
  40% { transform: scale(1.2); opacity: 1; }
}
</style>

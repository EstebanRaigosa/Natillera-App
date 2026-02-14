<template>
  <Teleport to="body">
    <template v-if="show">
      <!-- Versión iOS/Safari: estructura desde cero para vista y scroll correctos -->
      <div
        v-if="isIos"
        :class="['modal-wrapper-ios', align === 'bottom' ? 'modal-wrapper-ios--bottom' : '']"
        :style="{ zIndex: zIndex }"
        @click.self="$emit('close')"
      >
        <div
          class="modal-wrapper-ios__backdrop"
          aria-hidden="true"
          @click="$emit('close')"
          @touchstart.passive="$emit('close')"
        />
        <div
          class="modal-wrapper-ios__card"
          :style="cardMaxWidth ? { maxWidth: cardMaxWidth } : undefined"
          @click.stop
        >
          <slot />
        </div>
      </div>
      <!-- Versión Android/desktop: respeta las clases que ya usabas -->
      <div
        v-else
        :class="overlayClass"
        @click.self="$emit('close')"
      >
        <div
          class="absolute inset-0 bg-black/50 backdrop-blur-sm"
          style="pointer-events: auto !important; touch-action: manipulation !important; cursor: pointer !important; -webkit-tap-highlight-color: transparent; z-index: 0 !important;"
          aria-hidden="true"
          @click="$emit('close')"
          @touchstart="$emit('close')"
        />
        <div
          :class="cardClass"
          style="position: relative; z-index: 10;"
          @click.stop
        >
          <slot />
        </div>
      </div>
    </template>
  </Teleport>
</template>

<script setup>
import { useIsIos } from '../composables/useIsIos'

defineProps({
  show: { type: Boolean, default: false },
  zIndex: { type: Number, default: 50 },
  /** iOS: 'center' | 'bottom' (bottom = tipo bottom sheet en móvil) */
  align: { type: String, default: 'center' },
  /** Android: clases del overlay (fixed inset-0 flex ...) */
  overlayClass: { type: String, default: 'fixed inset-0 z-50 flex items-center justify-center p-4' },
  /** Android: clases de la card (relative max-w-md ...) */
  cardClass: { type: String, default: 'relative max-w-lg w-full bg-white rounded-2xl shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto' },
  /** iOS: ancho máximo de la card (ej. '28rem' para max-w-md, '42rem' para max-w-2xl) */
  cardMaxWidth: { type: String, default: '' }
})

defineEmits(['close'])

const isIos = useIsIos()
</script>

<style scoped>
/* Modal para iOS/Safari: safe area, scroll que funciona, altura que quepa en pantalla */

.modal-wrapper-ios {
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
  padding-top: env(safe-area-inset-top, 0) !important;
  padding-right: env(safe-area-inset-right, 0) !important;
  padding-bottom: env(safe-area-inset-bottom, 0) !important;
  padding-left: env(safe-area-inset-left, 0) !important;
  box-sizing: border-box;
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  justify-content: center !important;
  overflow-y: auto !important;
  overflow-x: hidden !important;
  -webkit-overflow-scrolling: touch;
  touch-action: pan-y;
  -webkit-transform: translate3d(0, 0, 0);
  transform: translate3d(0, 0, 0);
}

.modal-wrapper-ios--bottom {
  justify-content: flex-end !important;
}

.modal-wrapper-ios--bottom .modal-wrapper-ios__card {
  border-radius: 1rem 1rem 0 0 !important;
  border-bottom: none !important;
}

.modal-wrapper-ios__backdrop {
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  background: rgba(0, 0, 0, 0.5);
  -webkit-backdrop-filter: blur(4px);
  backdrop-filter: blur(4px);
  z-index: 0 !important;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.modal-wrapper-ios__card {
  position: relative !important;
  z-index: 10 !important;
  width: 100% !important;
  max-width: 28rem !important;
  background: #fff !important;
  border-radius: 1rem 1rem 0 0 !important;
  box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.15) !important;
  border: 1px solid #e5e7eb !important;
  border-bottom: none !important;
  max-height: min(90dvh, calc(100dvh - env(safe-area-inset-top, 0) - env(safe-area-inset-bottom, 0) - 2rem)) !important;
  display: flex !important;
  flex-direction: column !important;
  min-height: 0 !important;
  flex-shrink: 0 !important;
  overflow: hidden !important;
  -webkit-overflow-scrolling: touch;
}

.modal-wrapper-ios:not(.modal-wrapper-ios--bottom) .modal-wrapper-ios__card {
  border-radius: 1rem !important;
  border-bottom: 1px solid #e5e7eb !important;
}
</style>

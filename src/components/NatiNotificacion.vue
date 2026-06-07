<template>
  <Teleport to="body">
    <TransitionGroup
      name="nati"
      tag="div"
      class="nati-stack"
      role="region"
      aria-label="Notificaciones"
    >
      <div
        v-for="notification in notifications"
        :key="notification.id"
        :class="['nati', `nati--${normalizeVariant(notification.type)}`]"
        :role="isAssertive(notification.type) ? 'alert' : 'status'"
        :aria-live="isAssertive(notification.type) ? 'assertive' : 'polite'"
      >
        <span
          v-if="notification.duration > 0"
          class="nati__progress"
          :style="{ animationDuration: `${notification.duration}ms` }"
          aria-hidden="true"
        />

        <span class="nati__rail" aria-hidden="true" />

        <div class="nati__icon">
          <component :is="iconFor(notification.type)" class="w-5 h-5" />
        </div>

        <div class="nati__content">
          <p v-if="notification.title" class="nati__title">{{ notification.title }}</p>
          <p v-if="notification.message" class="nati__message">{{ notification.message }}</p>
        </div>

        <button
          type="button"
          class="nati__close"
          :aria-label="`Cerrar ${notification.title || 'notificación'}`"
          @click="dismiss(notification.id)"
        >
          <XMarkIcon class="w-4 h-4" />
        </button>
      </div>
    </TransitionGroup>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'
import { useNotificationStore } from '../stores/notifications'
import {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'

const store = useNotificationStore()
const notifications = computed(() => store.notifications)

const VARIANT_ALIASES = {
  success: 'exito',
  error: 'critica',
  warning: 'alerta',
  info: 'informacion'
}

const VALID_VARIANTS = ['exito', 'informacion', 'alerta', 'critica']

function normalizeVariant(type) {
  if (!type) return 'informacion'
  if (VALID_VARIANTS.includes(type)) return type
  return VARIANT_ALIASES[type] || 'informacion'
}

function iconFor(type) {
  const v = normalizeVariant(type)
  return {
    exito: CheckCircleIcon,
    informacion: InformationCircleIcon,
    alerta: ExclamationTriangleIcon,
    critica: XCircleIcon
  }[v]
}

function isAssertive(type) {
  const v = normalizeVariant(type)
  return v === 'critica' || v === 'alerta'
}

function dismiss(id) {
  store.remove(id)
}
</script>

<style scoped>
/* =========================================================================
   Nati-Notificación — toast del sistema de diseño Natillerapp
   Variantes: informacion · exito · alerta · critica
   Tipografía Mulish (heredada), color marca verde bosque por defecto.
   ========================================================================= */

/* Stack centrado en la parte superior de la pantalla — máxima visibilidad
   sin colisionar con el sidebar derecho ni con el bottom nav móvil. */
.nati-stack {
  position: fixed;
  z-index: 9999;
  top: max(1rem, env(safe-area-inset-top));
  left: 50%;
  right: auto;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.625rem;
  width: min(100vw - 2rem, 26rem);
  pointer-events: none;
}

@media (max-width: 480px) {
  .nati-stack {
    width: calc(100vw - 1.5rem);
    max-width: none;
  }
}

.nati {
  position: relative;
  pointer-events: auto;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: flex-start;
  gap: 0.75rem;
  width: 100%;
  padding: 0.875rem 0.875rem 0.875rem 1.125rem;
  background: var(--surface-card, #fff);
  border: 1px solid var(--surface-divider, rgba(15, 23, 42, 0.08));
  border-radius: var(--radius-lg, 1rem);
  box-shadow:
    0 18px 40px -12px rgba(15, 83, 45, 0.30),
    0 4px 14px -4px rgba(15, 23, 42, 0.10);
  overflow: hidden;
  font-family: var(--font-body), system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  -webkit-tap-highlight-color: transparent;
  transform: translate3d(0, 0, 0);
}

.nati__rail {
  position: absolute;
  inset: 0 auto 0 0;
  width: 4px;
  background: var(--nati-color, var(--brand-primary));
}

.nati__progress {
  position: absolute;
  inset: 0 0 auto 0;
  height: 2px;
  background: var(--nati-color, var(--brand-primary));
  transform-origin: left;
  animation-name: nati-progress;
  animation-timing-function: linear;
  animation-fill-mode: forwards;
  opacity: 0.7;
}

.nati__icon {
  flex-shrink: 0;
  width: 2rem;
  height: 2rem;
  border-radius: var(--radius-md, 0.75rem);
  background: var(--nati-soft, var(--brand-primary-soft));
  color: var(--nati-color, var(--brand-primary));
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 0.0625rem;
}

.nati__content {
  min-width: 0;
  padding-right: 0.25rem;
}

.nati__title {
  font-family: var(--font-display), system-ui, sans-serif;
  font-size: 0.875rem;
  font-weight: 700;
  line-height: 1.3;
  color: #0f172a;
  letter-spacing: -0.01em;
  margin: 0;
  overflow-wrap: anywhere;
}

.nati__message {
  font-size: 0.8125rem;
  font-weight: 400;
  line-height: 1.45;
  color: #475569;
  margin: 0.1875rem 0 0;
  overflow-wrap: anywhere;
}

.nati__close {
  flex-shrink: 0;
  width: 1.75rem;
  height: 1.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  color: #94a3b8;
  background: transparent;
  border: 0;
  cursor: pointer;
  touch-action: manipulation;
  transition: background-color 150ms ease, color 150ms ease;
  margin-top: 0.125rem;
}

.nati__close:hover,
.nati__close:focus-visible {
  background: rgba(15, 23, 42, 0.06);
  color: #0f172a;
  outline: none;
}

.nati__close:active {
  transform: scale(0.95);
}

/* === Variantes ============================================================ */

.nati--informacion {
  --nati-color: var(--brand-primary, #1B5E37);
  --nati-soft: var(--brand-primary-soft, #E8F5E9);
}

.nati--exito {
  --nati-color: var(--brand-success, #15803d);
  --nati-soft: #dcfce7;
}

.nati--alerta {
  --nati-color: var(--brand-warning, #b45309);
  --nati-soft: #fef3c7;
}

.nati--critica {
  --nati-color: var(--brand-danger, #dc2626);
  --nati-soft: #fee2e2;
}

/* Crítica: enfatiza con un sutil tinte rojo en el fondo de la card */
.nati--critica {
  background: linear-gradient(180deg, #fff 0%, #fffafa 100%);
  border-color: rgba(220, 38, 38, 0.20);
}

/* === Animaciones ========================================================= */

@keyframes nati-progress {
  from { transform: scaleX(1); }
  to   { transform: scaleX(0); }
}

.nati-enter-active {
  transition:
    transform 320ms cubic-bezier(0.32, 0.72, 0.20, 1),
    opacity 220ms ease-out;
}

.nati-leave-active {
  transition:
    transform 220ms cubic-bezier(0.4, 0, 1, 1),
    opacity 180ms ease-in;
  position: absolute;
  left: 50%;
  right: auto;
  transform: translateX(-50%);
  width: min(100vw - 2rem, 26rem);
}

/* Entrada/salida desde arriba (acompaña la nueva posición top-center) */
.nati-enter-from {
  opacity: 0;
  transform: translate3d(0, -120%, 0) scale(0.96);
}

.nati-leave-to {
  opacity: 0;
  transform: translate3d(0, -40%, 0) scale(0.97);
}

.nati-move {
  transition: transform 280ms cubic-bezier(0.32, 0.72, 0.20, 1);
}

/* iOS / Safari: la card del toast usa transform; reforzamos la capa GPU
   para evitar el bug de hijos con position:absolute mal alineados. */
@supports (-webkit-touch-callout: none) {
  .nati {
    -webkit-transform: translate3d(0, 0, 0);
  }
  .nati__progress {
    -webkit-transform: scaleX(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .nati-enter-active,
  .nati-leave-active,
  .nati-move {
    transition: opacity 120ms linear;
  }
  .nati-enter-from,
  .nati-leave-to {
    transform: none;
  }
  .nati__progress {
    animation: none;
    display: none;
  }
}
</style>

<template>
  <Teleport to="body">
    <TransitionGroup
      name="toast"
      tag="div"
      class="fixed top-4 right-4 z-[9999] flex flex-col gap-4 max-w-md w-full sm:w-auto pointer-events-none"
    >
      <div
        v-for="notification in notifications"
        :key="notification.id"
        class="pointer-events-auto"
      >
        <div
          :class="[
            'relative overflow-hidden rounded-3xl shadow-2xl border-2 backdrop-blur-xl transition-all duration-300 hover:scale-[1.02]',
            getNotificationClasses(notification.type)
          ]"
        >
          <!-- Barra de progreso superior -->
          <div
            v-if="notification.duration > 0"
            :class="[
              'absolute top-0 left-0 right-0 h-1.5 origin-left',
              getProgressBarClasses(notification.type)
            ]"
            :style="{ animation: `progress ${notification.duration}ms linear forwards` }"
          ></div>

          <!-- Efectos decorativos de fondo -->
          <div class="absolute inset-0 overflow-hidden">
            <!-- Brillo superior -->
            <div :class="[
              'absolute top-0 left-1/4 w-32 h-32 rounded-full blur-3xl opacity-40',
              getGlowClasses(notification.type)
            ]"></div>
            <!-- Brillo inferior -->
            <div :class="[
              'absolute bottom-0 right-1/4 w-24 h-24 rounded-full blur-2xl opacity-30',
              getGlowClasses(notification.type)
            ]"></div>
          </div>

          <!-- Patrón de fondo sutil -->
          <div class="absolute inset-0 opacity-[0.03]">
            <div class="absolute inset-0" style="background-image: radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0); background-size: 24px 24px;"></div>
          </div>
          
          <!-- Contenido principal -->
          <div class="relative z-10 p-5 sm:p-6">
            <div class="flex items-start gap-4">
              <!-- Icono con efecto de resplandor -->
              <div :class="[
                'relative flex-shrink-0',
                'w-14 h-14 rounded-2xl flex items-center justify-center',
                'shadow-lg ring-4 ring-white/50',
                getIconClasses(notification.type)
              ]">
                <!-- Resplandor interno -->
                <div class="absolute inset-0 rounded-2xl bg-white/30 blur-sm"></div>
                <component 
                  :is="getIcon(notification.type)" 
                  class="relative w-7 h-7 text-white drop-shadow-lg"
                />
              </div>
              
              <!-- Contenido de texto -->
              <div class="flex-1 min-w-0 pt-0.5">
                <h4 :class="[
                  'font-bold text-base sm:text-lg mb-1.5 tracking-tight',
                  getTitleClasses(notification.type)
                ]">
                  {{ notification.title }}
                </h4>
                <p :class="[
                  'text-sm sm:text-base leading-relaxed',
                  getMessageClasses(notification.type)
                ]">
                  {{ notification.message }}
                </p>
              </div>
              
              <!-- Botón cerrar mejorado -->
              <button
                @click="removeNotification(notification.id)"
                :class="[
                  'flex-shrink-0 w-9 h-9 rounded-xl',
                  'flex items-center justify-center',
                  'transition-all duration-200',
                  'hover:scale-110 active:scale-95',
                  getCloseButtonClasses(notification.type)
                ]"
                aria-label="Cerrar notificación"
              >
                <XMarkIcon class="w-5 h-5" />
              </button>
            </div>
          </div>

          <!-- Borde decorativo lateral -->
          <div :class="[
            'absolute left-0 top-0 bottom-0 w-1.5',
            getSideBorderClasses(notification.type)
          ]"></div>
        </div>
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
} from '@heroicons/vue/24/solid'

const notificationStore = useNotificationStore()

const notifications = computed(() => notificationStore.notifications)

function removeNotification(id) {
  notificationStore.remove(id)
}

function getNotificationClasses(type) {
  const classes = {
    success: 'bg-gradient-to-br from-emerald-50 via-white to-green-50/80 border-emerald-300/60 shadow-emerald-500/20',
    error: 'bg-gradient-to-br from-rose-50 via-white to-red-50/80 border-rose-300/60 shadow-rose-500/20',
    warning: 'bg-gradient-to-br from-amber-50 via-white to-orange-50/80 border-amber-300/60 shadow-amber-500/20',
    info: 'bg-gradient-to-br from-blue-50 via-white to-cyan-50/80 border-blue-300/60 shadow-blue-500/20'
  }
  return classes[type] || classes.info
}

function getIconClasses(type) {
  const classes = {
    success: 'bg-gradient-to-br from-emerald-500 via-green-500 to-emerald-600 shadow-emerald-500/50',
    error: 'bg-gradient-to-br from-rose-500 via-red-500 to-rose-600 shadow-rose-500/50',
    warning: 'bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 shadow-amber-500/50',
    info: 'bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 shadow-blue-500/50'
  }
  return classes[type] || classes.info
}

function getTitleClasses(type) {
  const classes = {
    success: 'text-emerald-900',
    error: 'text-rose-900',
    warning: 'text-amber-900',
    info: 'text-blue-900'
  }
  return classes[type] || classes.info
}

function getMessageClasses(type) {
  const classes = {
    success: 'text-gray-700/90',
    error: 'text-gray-700/90',
    warning: 'text-gray-700/90',
    info: 'text-gray-700/90'
  }
  return classes[type] || classes.info
}

function getCloseButtonClasses(type) {
  const classes = {
    success: 'text-gray-400 hover:text-emerald-700 hover:bg-emerald-100/80 active:bg-emerald-200',
    error: 'text-gray-400 hover:text-rose-700 hover:bg-rose-100/80 active:bg-rose-200',
    warning: 'text-gray-400 hover:text-amber-700 hover:bg-amber-100/80 active:bg-amber-200',
    info: 'text-gray-400 hover:text-blue-700 hover:bg-blue-100/80 active:bg-blue-200'
  }
  return classes[type] || classes.info
}

function getProgressBarClasses(type) {
  const classes = {
    success: 'bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-400',
    error: 'bg-gradient-to-r from-rose-500 via-red-500 to-rose-400',
    warning: 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400',
    info: 'bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-400'
  }
  return classes[type] || classes.info
}

function getGlowClasses(type) {
  const classes = {
    success: 'bg-emerald-400',
    error: 'bg-rose-400',
    warning: 'bg-amber-400',
    info: 'bg-blue-400'
  }
  return classes[type] || classes.info
}

function getSideBorderClasses(type) {
  const classes = {
    success: 'bg-gradient-to-b from-emerald-400 via-emerald-500 to-emerald-400',
    error: 'bg-gradient-to-b from-rose-400 via-rose-500 to-rose-400',
    warning: 'bg-gradient-to-b from-amber-400 via-amber-500 to-amber-400',
    info: 'bg-gradient-to-b from-blue-400 via-blue-500 to-blue-400'
  }
  return classes[type] || classes.info
}

function getIcon(type) {
  const icons = {
    success: CheckCircleIcon,
    error: XCircleIcon,
    warning: ExclamationTriangleIcon,
    info: InformationCircleIcon
  }
  return icons[type] || icons.info
}
</script>

<style scoped>
/* Animación de entrada más suave y moderna */
.toast-enter-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.toast-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 1, 1);
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(120%) scale(0.9);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(120%) scale(0.95);
}

.toast-move {
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Animación de la barra de progreso */
@keyframes progress {
  from {
    transform: scaleX(1);
  }
  to {
    transform: scaleX(0);
  }
}

/* Efecto de brillo en el icono */
@keyframes shimmer {
  0% {
    background-position: -200% center;
  }
  100% {
    background-position: 200% center;
  }
}
</style>

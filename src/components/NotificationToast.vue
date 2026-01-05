<template>
  <Teleport to="body">
    <TransitionGroup
      name="toast"
      tag="div"
      class="fixed top-4 right-4 z-[9999] flex flex-col gap-3 max-w-md w-full sm:w-auto pointer-events-none"
    >
      <div
        v-for="notification in notifications"
        :key="notification.id"
        class="pointer-events-auto"
      >
        <div
          :class="[
            'relative overflow-hidden rounded-2xl shadow-2xl border backdrop-blur-sm p-4 sm:p-5 animate-fade-in-up',
            getNotificationClasses(notification.type)
          ]"
        >
          <!-- Efectos decorativos -->
          <div class="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-xl -translate-y-1/2 translate-x-1/2"></div>
          <div class="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full blur-lg translate-y-1/2 -translate-x-1/2"></div>
          
          <div class="relative z-10 flex items-start gap-3">
            <!-- Icono -->
            <div :class="[
              'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg',
              getIconClasses(notification.type)
            ]">
              <component :is="getIcon(notification.type)" class="w-5 h-5 text-white" />
            </div>
            
            <!-- Contenido -->
            <div class="flex-1 min-w-0">
              <h4 :class="[
                'font-display font-bold text-sm sm:text-base mb-1',
                getTitleClasses(notification.type)
              ]">
                {{ notification.title }}
              </h4>
              <p :class="[
                'text-sm',
                getMessageClasses(notification.type)
              ]">
                {{ notification.message }}
              </p>
            </div>
            
            <!-- Botón cerrar -->
            <button
              @click="removeNotification(notification.id)"
              :class="[
                'flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
                getCloseButtonClasses(notification.type)
              ]"
            >
              <XMarkIcon class="w-4 h-4" />
            </button>
          </div>
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
    success: 'bg-gradient-to-br from-white via-green-50/30 to-emerald-50/20 border-green-200/50',
    error: 'bg-gradient-to-br from-white via-red-50/30 to-rose-50/20 border-red-200/50',
    warning: 'bg-gradient-to-br from-white via-amber-50/30 to-orange-50/20 border-amber-200/50',
    info: 'bg-gradient-to-br from-white via-blue-50/30 to-cyan-50/20 border-blue-200/50'
  }
  return classes[type] || classes.info
}

function getIconClasses(type) {
  const classes = {
    success: 'bg-gradient-to-br from-green-400 to-green-600 shadow-green-500/30',
    error: 'bg-gradient-to-br from-red-400 to-red-600 shadow-red-500/30',
    warning: 'bg-gradient-to-br from-amber-400 to-amber-600 shadow-amber-500/30',
    info: 'bg-gradient-to-br from-blue-400 to-blue-600 shadow-blue-500/30'
  }
  return classes[type] || classes.info
}

function getTitleClasses(type) {
  const classes = {
    success: 'text-green-800',
    error: 'text-red-800',
    warning: 'text-amber-800',
    info: 'text-blue-800'
  }
  return classes[type] || classes.info
}

function getMessageClasses(type) {
  const classes = {
    success: 'text-gray-700',
    error: 'text-gray-700',
    warning: 'text-gray-700',
    info: 'text-gray-700'
  }
  return classes[type] || classes.info
}

function getCloseButtonClasses(type) {
  const classes = {
    success: 'text-gray-400 hover:bg-green-100 hover:text-green-700',
    error: 'text-gray-400 hover:bg-red-100 hover:text-red-700',
    warning: 'text-gray-400 hover:bg-amber-100 hover:text-amber-700',
    info: 'text-gray-400 hover:bg-blue-100 hover:text-blue-700'
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
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.toast-move {
  transition: transform 0.3s ease;
}
</style>


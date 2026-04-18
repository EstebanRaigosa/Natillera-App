<template>
  <ModalWrapper
    :show="show"
    :z-index="10000"
    align="bottom"
    :ios-soft-backdrop="true"
    :persistent="true"
    overlay-class="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center p-0 sm:p-4"
    backdrop-class="absolute inset-0 bg-[#C8D9C8]/70 backdrop-blur-[2px]"
    card-class="relative w-full sm:max-w-md max-h-[90vh] flex flex-col rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border border-gray-200/60 bg-white"
    card-max-width="28rem"
  >
    <!-- Misma línea visual que modal «Crear primer socio» (NatilleraDetalle): bosque #1B5E37 + cuerpo blanco + CTA redondo -->
    <div class="relative flex-shrink-0 bg-[#1B5E37] px-6 pt-[max(2rem,env(safe-area-inset-top))] pb-7 text-center">
      <div class="w-16 h-16 mx-auto mb-4 bg-white rounded-full flex items-center justify-center shadow-sm">
        <UserIcon class="w-8 h-8 text-[#1B5E37]" />
      </div>
      <h3 class="font-display font-bold text-white text-xl sm:text-2xl mb-1.5">
        Completa tu perfil
      </h3>
      <p class="text-sm sm:text-base text-white/85 font-normal leading-snug max-w-sm mx-auto">
        Agrega un nombre de usuario para continuar
      </p>
    </div>

    <div class="min-h-0 overflow-y-auto flex-1 px-6 pt-6 pb-2 space-y-5 bg-white overscroll-contain [-webkit-overflow-scrolling:touch]">
      <div class="rounded-xl bg-[#E8F5E9] px-4 py-3.5 flex gap-3 items-start">
        <InformationCircleIcon class="w-5 h-5 text-[#1B5E37] flex-shrink-0 mt-0.5" />
        <div class="text-left text-sm text-gray-800 leading-relaxed">
          <span class="font-semibold text-[#1B5E37]">Importante</span>
          <span class="text-gray-700">
            Este nombre se mostrará en tu perfil y en las actividades de la natillera.
          </span>
        </div>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-sm font-semibold text-gray-800 mb-2">
            Nombre de usuario <span class="text-red-500">*</span>
          </label>
          <input
            v-model="username"
            type="text"
            placeholder="Tu nombre completo"
            class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 text-base outline-none transition-all placeholder:text-gray-400 focus:ring-2 focus:ring-[#1B5E37]/35 focus:border-[#1B5E37]"
            :class="{
              'border-red-300 focus:border-red-500 focus:ring-red-500/30': error
            }"
            :disabled="loading"
            required
            autofocus
            minlength="2"
            maxlength="100"
          />
          <p v-if="error" class="mt-1.5 text-xs text-red-600">{{ error }}</p>
          <p v-else class="mt-1.5 text-xs text-gray-500">
            Será tu nombre visible en la plataforma
          </p>
        </div>
      </form>
    </div>

    <div class="flex-shrink-0 px-6 pt-2 pb-[max(1.25rem,env(safe-area-inset-bottom))] space-y-3 bg-white border-t border-gray-100/90">
      <button
        type="button"
        :disabled="loading || !username.trim() || username.trim().length < 2"
        class="w-full min-h-[48px] px-5 py-3.5 rounded-full bg-[#1B5E37] hover:bg-[#154a2d] active:bg-[#124228] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm [-webkit-tap-highlight-color:transparent] touch-manipulation"
        @click="handleSubmit"
      >
        <span v-if="loading" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        <span v-else>Guardar</span>
      </button>
    </div>
  </ModalWrapper>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, toRef } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'
import { UserIcon, InformationCircleIcon } from '@heroicons/vue/24/outline'
import ModalWrapper from './ModalWrapper.vue'
import { useBodyScrollLock } from '../composables/useBodyScrollLock'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'saved'])

const showRef = toRef(props, 'show')
useBodyScrollLock(showRef)

const router = useRouter()
const authStore = useAuthStore()
const username = ref('')
const loading = ref(false)
const error = ref('')

function handleKeydown(event) {
  if (event.key === 'Escape' && props.show) {
    event.preventDefault()
    event.stopPropagation()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})

watch(() => props.show, (newValue) => {
  if (newValue) {
    if (!authStore.isAuthenticated || !authStore.user) {
      emit('close')
      router.push({ name: 'Login' })
      return
    }

    username.value = ''
    error.value = ''
    if (authStore.user?.email && !authStore.user?.user_metadata?.nombre) {
      const emailName = authStore.user.email.split('@')[0]
      username.value = emailName
    }
  }
})

watch(() => authStore.isAuthenticated, (isAuthenticated) => {
  if (props.show && !isAuthenticated) {
    emit('close')
    router.push({ name: 'Login' })
  }
})

async function handleSubmit() {
  if (!authStore.isAuthenticated || !authStore.user) {
    emit('close')
    router.push({ name: 'Login' })
    return
  }

  if (!username.value.trim() || username.value.trim().length < 2) {
    error.value = 'El nombre debe tener al menos 2 caracteres'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const result = await authStore.updateDisplayName(username.value.trim())

    if (result.success) {
      emit('saved')
      emit('close')
    } else {
      error.value = result.error || 'Error al guardar el nombre de usuario'
    }
  } catch (e) {
    error.value = 'Error al guardar el nombre de usuario. Por favor, intenta nuevamente.'
    console.error('Error guardando nombre de usuario:', e)
  } finally {
    loading.value = false
  }
}
</script>

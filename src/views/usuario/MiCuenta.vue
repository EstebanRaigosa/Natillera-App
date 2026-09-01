<template>
  <div class="mx-auto max-w-4xl space-y-6">
    <div>
      <h1 class="font-display text-2xl font-bold text-gray-800 sm:text-3xl">Mi cuenta</h1>
      <p class="mt-1 text-gray-500">Tus datos y tus preferencias personales</p>
    </div>

    <!-- ── Identidad ── -->
    <div class="card">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center">
        <img
          :src="avatar"
          :alt="auth.userName || ''"
          class="h-16 w-16 shrink-0 rounded-full ring-2 ring-[#1B5E37]/15"
          width="64"
          height="64"
          decoding="async"
          draggable="false"
        />
        <div class="min-w-0 flex-1">
          <p class="truncate font-display text-lg font-bold text-gray-900">{{ auth.userName }}</p>
          <p class="truncate text-sm text-gray-500">{{ auth.userEmail }}</p>
        </div>
        <button
          type="button"
          class="btn-modal-secondary shrink-0 !min-h-[44px] px-4 text-sm"
          @click="editandoNombre = true"
        >
          <PencilSquareIcon class="mr-1.5 h-4 w-4" />
          Cambiar nombre
        </button>
      </div>
    </div>

    <!--
      Preferencias personales. Viven aquí y no en /configuracion a propósito:
      esa pantalla guarda los mensajes por defecto, el periodo y los días de
      gracia, que son ajustes de la natillera y valen para todo el mundo. Los
      avisos push y el botón flotante son de esta persona y de este dispositivo.
    -->
    <AjustesNotificaciones />
    <AjustesBotonSoporte />

    <!-- Puente hacia la otra configuración, para que nadie las confunda -->
    <div class="card">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div class="min-w-0 flex-1">
          <h2 class="font-display text-base font-bold text-gray-800">¿Buscabas los mensajes de recordatorio?</h2>
          <p class="mt-1 text-sm leading-relaxed text-gray-600">
            Las plantillas de WhatsApp, el periodo y los días de gracia son ajustes de la
            natillera, no de tu cuenta, y viven en otra pantalla.
          </p>
        </div>
        <RouterLink to="/configuracion" class="btn-modal-secondary shrink-0 !min-h-[44px] px-4 text-sm">
          Ir a Configuración
        </RouterLink>
      </div>
    </div>

    <UsernameModal :show="editandoNombre" @close="editandoNombre = false" @saved="editandoNombre = false" />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { PencilSquareIcon } from '@heroicons/vue/24/outline'
import AjustesNotificaciones from '../../components/soporte/AjustesNotificaciones.vue'
import AjustesBotonSoporte from '../../components/soporte/AjustesBotonSoporte.vue'
import UsernameModal from '../../components/UsernameModal.vue'
import { useAuthStore } from '../../stores/auth'
import { getAvatarUrl } from '../../utils/avatars'

const auth = useAuthStore()
const editandoNombre = ref(false)

const avatar = computed(() => getAvatarUrl(auth.userEmail || auth.userName))
</script>

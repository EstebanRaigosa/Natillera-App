<template>
  <div v-if="invitaciones.length > 0" class="space-y-3">
    <!-- Header -->
    <div class="flex items-center justify-between px-1">
      <h3 class="text-sm font-semibold text-gray-700">Invitaciones Pendientes</h3>
      <span class="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
        {{ invitaciones.length }}
      </span>
    </div>

    <!-- Lista de invitaciones -->
    <div class="space-y-2">
      <div
        v-for="invitacion in invitaciones"
        :key="invitacion.id"
        class="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-3 shadow-sm"
      >
        <div class="flex items-start gap-3">
          <div class="w-10 h-10 rounded-lg overflow-hidden shadow flex-shrink-0">
            <img
              :src="getNatilleraAvatarUrl(invitacion.natillera_nombre)"
              :alt="invitacion.natillera_nombre"
              class="w-full h-full object-cover"
            />
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-semibold text-gray-800 text-sm truncate">{{ invitacion.natillera_nombre }}</p>
            <p class="text-xs text-gray-500 truncate">
              De: {{ invitacion.invitado_por_nombre }}
            </p>
            <div class="flex items-center gap-2 mt-2">
              <button
                @click="aceptar(invitacion)"
                :disabled="procesando === invitacion.id"
                class="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
              >
                {{ procesando === invitacion.id ? '...' : 'Aceptar' }}
              </button>
              <button
                @click="rechazar(invitacion)"
                :disabled="procesando === invitacion.id"
                class="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
              >
                Rechazar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useColaboradoresStore } from '../stores/colaboradores'
import { useNatillerasStore } from '../stores/natilleras'
import { useNotificationStore } from '../stores/notifications'
import { getNatilleraAvatarUrl } from '../utils/avatars'

const colaboradoresStore = useColaboradoresStore()
const natillerasStore = useNatillerasStore()
const notificationStore = useNotificationStore()

const procesando = ref(null)

const invitaciones = computed(() => colaboradoresStore.misInvitaciones)

async function aceptar(invitacion) {
  try {
    procesando.value = invitacion.id
    
    const resultado = await colaboradoresStore.aceptarInvitacion(invitacion.token_invitacion)
    
    if (resultado.success) {
      notificationStore.success(
        `Ahora eres colaborador de "${resultado.data.natillera_nombre}"`,
        '¡Invitación aceptada!'
      )
      // Recargar natilleras compartidas
      await natillerasStore.fetchNatillerasCompartidas()
    } else {
      notificationStore.error(resultado.error || 'Error al aceptar la invitación')
    }
  } catch (e) {
    notificationStore.error(e.message || 'Error al aceptar la invitación')
  } finally {
    procesando.value = null
  }
}

async function rechazar(invitacion) {
  if (!confirm('¿Estás seguro de que deseas rechazar esta invitación?')) {
    return
  }

  try {
    procesando.value = invitacion.id
    
    const resultado = await colaboradoresStore.rechazarInvitacion(invitacion.token_invitacion)
    
    if (resultado.success) {
      notificationStore.info('Invitación rechazada')
    } else {
      notificationStore.error(resultado.error || 'Error al rechazar la invitación')
    }
  } catch (e) {
    notificationStore.error(e.message || 'Error al rechazar la invitación')
  } finally {
    procesando.value = null
  }
}

onMounted(async () => {
  await colaboradoresStore.fetchMisInvitaciones()
})
</script>


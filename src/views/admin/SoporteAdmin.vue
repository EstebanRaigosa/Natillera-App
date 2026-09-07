<template>
  <div ref="raiz" class="flex min-h-0 flex-col">
    <!-- ── Cabecera ── -->
    <div class="mb-3 flex items-center gap-3">
      <div class="min-w-0 flex-1">
        <h1 class="truncate font-display text-xl font-bold text-gray-900 sm:text-2xl">Soporte</h1>
        <p class="mt-0.5 text-xs text-gray-500 sm:text-sm">
          {{ soporte.totalBandeja }} conversación{{ soporte.totalBandeja === 1 ? '' : 'es' }}
          <span v-if="estadoCanal === 'degradado'" class="text-amber-700">· actualización cada minuto</span>
        </p>
      </div>
    </div>

    <PanelBandejaSoporte :usar-ruta="true" @estado-canal="estadoCanal = $event" />
  </div>
</template>

<script setup>
/**
 * Página del panel de soporte.
 *
 * El acceso habitual es el modal que abre el botón flotante
 * (`PanelSoporteAdminModal`): trabajar sin salir de la pantalla en la que
 * estabas es lo normal. Esta ruta se conserva porque las notificaciones push
 * apuntan a una URL concreta y porque un enlace directo tiene que abrir algo.
 *
 * Toda la bandeja vive en `PanelBandejaSoporte`, compartido con el modal.
 */
import { ref } from 'vue'
import { useAltoDisponible } from '../../composables/useAltoDisponible'
import PanelBandejaSoporte from '../../components/soporte/PanelBandejaSoporte.vue'
import { useSoporteStore } from '../../stores/soporte'

const soporte = useSoporteStore()
const estadoCanal = ref('conectado')

// Igual que en la pantalla del usuario: la altura se mide sobre el viewport
// visible para que el redactor no quede bajo el teclado en iOS.
const raiz = ref(null)
useAltoDisponible(raiz)
</script>

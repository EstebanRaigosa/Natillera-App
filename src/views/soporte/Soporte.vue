<template>
  <div ref="raiz" class="flex min-h-0 flex-col">
    <!-- ── Cabecera de la pantalla ── -->
    <div class="mb-3 flex items-center gap-3">
      <div class="min-w-0 flex-1">
        <h1 class="truncate font-display text-xl font-bold text-gray-900 sm:text-2xl">Soporte</h1>
        <p class="mt-0.5 truncate text-xs text-gray-500 sm:text-sm">
          Escríbenos y te respondemos por aquí mismo
        </p>
      </div>
      <button
        type="button"
        class="btn-modal-primary shrink-0 !min-h-[44px] px-4 text-sm"
        @click="panel?.abrirNueva()"
      >
        <PlusIcon class="mr-1.5 h-4 w-4" />
        Nueva
      </button>
    </div>

    <!--
      El contenido es el mismo componente que usa el panel flotante del botón de
      soporte; aquí en modo página: dos columnas en escritorio y sincronizado
      con la URL, para que una notificación pueda abrir /soporte/:id.
    -->
    <PanelConversaciones ref="panel" :usar-ruta="true" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { PlusIcon } from '@heroicons/vue/24/outline'
import PanelConversaciones from '../../components/soporte/PanelConversaciones.vue'
import { useAltoDisponible } from '../../composables/useAltoDisponible'

const panel = ref(null)

// El alto se mide, no se calcula: así el hilo tiene scroll propio y el redactor
// queda anclado abajo aunque cambie la cabecera del layout o se abra el teclado.
const raiz = ref(null)
useAltoDisponible(raiz)
</script>

<template>
  <div class="card">
    <div class="mb-5 flex items-center gap-3">
      <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-400 to-green-600">
        <ChatBubbleOvalLeftEllipsisIcon class="h-5 w-5 text-white" />
      </div>
      <div class="min-w-0">
        <h2 class="font-display text-lg font-bold text-gray-800">Botón de soporte</h2>
        <p class="text-sm text-gray-500">El acceso rápido que flota sobre la pantalla</p>
      </div>
    </div>

    <div class="flex flex-col gap-4 sm:flex-row sm:items-center">
      <p class="min-w-0 flex-1 text-sm leading-relaxed text-gray-600">
        Puedes arrastrarlo a donde te estorbe menos: se queda pegado al lado más cercano y
        recuerda dónde lo dejaste. Manteniéndolo pulsado aparece la opción de ocultarlo.
      </p>

      <!-- Interruptor con etiqueta textual: el estado no se deja al color -->
      <button
        type="button"
        role="switch"
        :aria-checked="visible"
        :class="[
          'inline-flex min-h-[44px] shrink-0 items-center gap-2.5 rounded-full px-4 text-sm font-semibold transition touch-manipulation',
          visible ? 'bg-[#1B5E37] text-white' : 'border border-gray-300 bg-white text-gray-700',
        ]"
        @click="alternar"
      >
        <span
          :class="[
            'relative h-5 w-9 shrink-0 rounded-full transition',
            visible ? 'bg-white/30' : 'bg-gray-300',
          ]"
        >
          <span
            :class="[
              'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all',
              visible ? 'left-[1.125rem]' : 'left-0.5',
            ]"
          />
        </span>
        {{ visible ? 'Visible' : 'Oculto' }}
      </button>
    </div>

    <div class="mt-3 flex flex-wrap gap-2">
      <button
        v-if="visible"
        type="button"
        class="inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 touch-manipulation"
        @click="restablecer"
      >
        <ArrowPathIcon class="h-4 w-4" />
        Devolverlo a su sitio
      </button>

      <!--
        Vía de rescate. El soporte ya no tiene entrada en el menú lateral, así
        que con el botón oculto este enlace es la única forma de llegar: sin él,
        ocultarlo dejaría al usuario encerrado fuera de su propia conversación.
      -->
      <RouterLink
        to="/soporte"
        class="inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 touch-manipulation"
      >
        <ChatBubbleOvalLeftEllipsisIcon class="h-4 w-4" />
        Abrir el soporte
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router'
import { ArrowPathIcon, ChatBubbleOvalLeftEllipsisIcon } from '@heroicons/vue/24/outline'
import { useBotonSoporte } from '../../composables/useBotonSoporte'
import { useNotificationStore } from '../../stores/notifications'

const { visible, alternar: alternarBoton, restablecerPosicion } = useBotonSoporte()
const notificaciones = useNotificationStore()

function alternar() {
  alternarBoton()
}

function restablecer() {
  restablecerPosicion()
  notificaciones.exito('El botón vuelve a su posición original.')
}
</script>

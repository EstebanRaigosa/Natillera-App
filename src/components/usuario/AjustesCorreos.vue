<template>
  <div class="card">
    <div class="mb-5 flex items-center gap-3">
      <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-400 to-green-600">
        <EnvelopeIcon class="h-5 w-5 text-white" />
      </div>
      <div class="min-w-0">
        <h2 class="font-display text-lg font-bold text-texto">Correos de Natillerapp</h2>
        <p class="text-sm text-texto-suave">Encuestas y novedades de la app</p>
      </div>
    </div>

    <div class="flex flex-col gap-4 sm:flex-row sm:items-center">
      <p class="min-w-0 flex-1 text-sm leading-relaxed text-texto-secundario">
        De vez en cuando te preguntamos cómo te va con la app o te contamos algo nuevo.
        Los correos de soporte te llegan igual, porque responden a algo que tú pediste.
      </p>

      <!-- Interruptor con etiqueta textual: el estado no se deja al color -->
      <button
        type="button"
        role="switch"
        :aria-checked="recibir"
        :disabled="cargando || guardando"
        :class="[
          'inline-flex min-h-[44px] shrink-0 items-center gap-2.5 rounded-full px-4 text-sm font-semibold transition touch-manipulation disabled:opacity-60',
          recibir ? 'bg-[#1B5E37] text-white' : 'border border-borde-fuerte bg-superficie-tarjeta text-texto-medio',
        ]"
        @click="alternar"
      >
        <span
          :class="[
            'relative h-5 w-9 shrink-0 rounded-full transition',
            recibir ? 'bg-white/30' : 'bg-borde-fuerte',
          ]"
        >
          <!-- tema-fijo: la perilla del interruptor es blanca en los dos modos -->
          <span class="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all" :class="recibir ? 'left-[1.125rem]' : 'left-0.5'" />
        </span>
        {{ recibir ? 'Recibir' : 'No recibir' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { EnvelopeIcon } from '@heroicons/vue/24/outline'
import { supabase } from '../../lib/supabase'
import { useNotificationStore } from '../../stores/notifications'

const notificaciones = useNotificationStore()

// Por defecto sí: es lo que vale para quien nunca lo ha cambiado.
const recibir = ref(true)
const cargando = ref(true)
const guardando = ref(false)

onMounted(async () => {
  try {
    const { data, error } = await supabase.rpc('correos_mi_preferencia')
    if (error) throw error
    recibir.value = data !== false
  } catch {
    // Sin dato se queda en «Recibir», que es el valor por defecto real.
  } finally {
    cargando.value = false
  }
})

async function alternar() {
  const nuevo = !recibir.value
  // Se cambia ya y se deshace si falla: esperar a la red para mover el interruptor
  // hace que parezca que no respondió al toque.
  recibir.value = nuevo
  guardando.value = true
  try {
    const { error } = await supabase.rpc('correos_cambiar_preferencia', { p_recibir: nuevo })
    if (error) throw error
    notificaciones.exito(nuevo ? 'Volverás a recibir nuestros correos.' : 'Ya no te enviaremos encuestas ni novedades.')
  } catch {
    recibir.value = !nuevo
    notificaciones.critica('No se pudo guardar. Inténtalo de nuevo.')
  } finally {
    guardando.value = false
  }
}
</script>

<template>
  <!-- Oculto hasta liberar el modo oscuro (MODO_OSCURO_LIBERADO en useTema) -->
  <div v-if="disponible" class="card">
    <div class="mb-5 flex items-center gap-3">
      <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-marca text-texto-sobre-marca">
        <SunIcon v-if="temaEfectivo === 'claro'" class="h-5 w-5" />
        <MoonIcon v-else class="h-5 w-5" />
      </div>
      <div class="min-w-0">
        <h2 class="font-display text-lg font-bold text-texto">Apariencia</h2>
        <p class="text-sm text-texto-suave">Modo claro, oscuro o el mismo de tu dispositivo</p>
      </div>
    </div>

    <SwitchSegmentado
      :model-value="preferencia"
      :opciones="OPCIONES"
      @update:model-value="elegir"
    />

    <!-- El inicio de sesión y las páginas públicas siguen en claro (docs/plan-modo-oscuro.md) -->
    <p class="mt-3 text-xs leading-relaxed text-texto-suave">
      El inicio de sesión y las páginas públicas se ven siempre en claro.
    </p>
  </div>
</template>

<script setup>
import { MoonIcon, SunIcon } from '@heroicons/vue/24/outline'
import SwitchSegmentado from './SwitchSegmentado.vue'
import { guardarTemaEnCuenta, useTema } from '../composables/useTema'
import { useAuthStore } from '../stores/auth'
import { useNotificationStore } from '../stores/notifications'

const OPCIONES = [
  { value: 'claro', label: 'Claro' },
  { value: 'oscuro', label: 'Oscuro' },
  { value: 'auto', label: 'Automático', ayuda: 'Sigue el modo de tu dispositivo' },
]

const auth = useAuthStore()
const notificaciones = useNotificationStore()
const { preferencia, temaEfectivo, disponible, cambiarTema } = useTema()

async function elegir(valor) {
  try {
    // En el dispositivo se aplica al instante; la cuenta se actualiza detrás
    await cambiarTema(valor, (v) => guardarTemaEnCuenta(auth.user?.id, v))
  } catch {
    notificaciones.warning('Se aplicó en este dispositivo, pero no se pudo guardar en tu cuenta.', 'Apariencia')
  }
}
</script>

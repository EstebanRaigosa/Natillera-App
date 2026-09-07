<template>
  <!--
    Aviso de versión nueva.

    Va arriba y no abajo porque abajo ya viven la barra de la natillera, el botón
    flotante de soporte y los pies de las modales; y se esconde mientras haya un
    modal abierto (`isBodyScrollLocked`, la misma señal que usa el botón de
    soporte) para no competir con lo que el usuario está haciendo.

    Teleport a body: cualquier ancestro con `transform` convertiría este `fixed`
    en relativo a él y lo dejaría fuera de sitio en iOS.
  -->
  <Teleport to="body">
    <Transition name="aviso-version">
      <div v-if="visible" class="aviso-version" role="status" aria-live="polite">
        <div class="flex items-center gap-3 rounded-full border border-white/15 bg-[#1B5E37] py-2 pl-4 pr-2 shadow-lg">
          <ArrowPathIcon :class="['h-5 w-5 shrink-0 text-white', actualizando ? 'animate-spin' : '']" />
          <p class="min-w-0 flex-1 text-sm font-semibold leading-snug text-white">
            {{ actualizando ? 'Actualizando…' : 'Hay una versión nueva' }}
          </p>
          <button
            type="button"
            class="inline-flex min-h-[2.75rem] shrink-0 items-center rounded-full bg-white px-4 text-sm font-bold text-[#1B5E37] transition hover:bg-white/90 disabled:opacity-60 touch-manipulation"
            :disabled="actualizando"
            @click="actualizar"
          >
            Actualizar
          </button>
          <button
            type="button"
            class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white/80 transition hover:bg-white/15 touch-manipulation"
            aria-label="Ahora no"
            :disabled="actualizando"
            @click="ocultado = true"
          >
            <XMarkIcon class="h-5 w-5" />
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, ref } from 'vue'
import { ArrowPathIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import { useActualizacionApp } from '../composables/useActualizacionApp'
import { isBodyScrollLocked } from '../composables/useBodyScrollLock'

const { hayVersionNueva, actualizando, actualizar } = useActualizacionApp()

/*
 * Descartarlo lo esconde en esta sesión, no cancela la actualización: sigue
 * esperando y se aplicará sola en cuanto la app pase a segundo plano. Que el
 * aviso reaparezca cada dos por tres sería peor que no avisar.
 */
const ocultado = ref(false)

const visible = computed(() =>
  hayVersionNueva.value && !ocultado.value && !isBodyScrollLocked.value)
</script>

<style scoped>
.aviso-version {
  position: fixed;
  z-index: 65;   /* sobre la app, por debajo de chat (70), visor (90) y modales */
  left: 0;
  right: 0;
  top: max(0.75rem, env(safe-area-inset-top));
  display: flex;
  justify-content: center;
  padding-left: max(0.75rem, env(safe-area-inset-left));
  padding-right: max(0.75rem, env(safe-area-inset-right));
  pointer-events: none;
  -webkit-transform: translate3d(0, 0, 0);
  transform: translate3d(0, 0, 0);
}

.aviso-version > * {
  pointer-events: auto;
  max-width: min(100%, 28rem);
}

.aviso-version-enter-active,
.aviso-version-leave-active {
  transition: opacity 0.2s ease, -webkit-transform 0.2s ease;
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.aviso-version-enter-from,
.aviso-version-leave-to {
  opacity: 0;
  -webkit-transform: translate3d(0, -0.75rem, 0);
  transform: translate3d(0, -0.75rem, 0);
}

@media (prefers-reduced-motion: reduce) {
  .aviso-version-enter-active,
  .aviso-version-leave-active {
    transition: none;
  }
}
</style>

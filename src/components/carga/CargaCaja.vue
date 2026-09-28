<template>
  <!--
    Carga pequeña. Las pantallas de carga de la app son tres, todas con la misma figura (la
    alcancía dentro de un anillo que gira):
      · CargaPantalla: pantalla completa, al entrar a una vista.
      · CargaCaja: esta, dentro de una sección, lista o modal mientras llega su contenido.
      · CargaCaja flotante: la misma caja sobre la página con el velo salvia, para una
        operación en curso (registrar un pago, reenviar un comprobante).
    Los skeletons por página y los giros dentro de botones son otra cosa y siguen aparte.

    Flotante va en Teleport a body (un ancestro con transform rompe el fixed en iOS) y no
    usa ModalWrapper porque no es un diálogo: no se cierra ni se toca, solo acompaña.
  -->
  <Teleport to="body" :disabled="!flotante">
    <Transition name="carga-caja-fundido">
      <div
        v-if="visible"
        :class="flotante ? 'carga-caja-capa fixed inset-0 z-[70] flex items-center justify-center p-4' : 'flex justify-center py-10'"
        @touchmove="flotante && $event.preventDefault()"
      >
        <div v-if="flotante" class="absolute inset-0 bg-[#C8D9C8]/85" aria-hidden="true" />
        <div
          :class="[
            'relative flex flex-col items-center text-center',
            flotante ? 'w-full max-w-[19rem] rounded-2xl border border-gray-200/60 bg-white px-5 py-6 shadow-2xl' : 'max-w-xs'
          ]"
          role="status"
          aria-live="polite"
        >
          <slot name="figura">
            <FiguraAlcancia :class="flotante ? 'h-24 w-24' : 'h-16 w-16'" />
          </slot>
          <p :class="['font-display font-bold text-gray-800', flotante ? 'mt-4 text-base' : 'mt-3 text-sm']">{{ texto || 'Cargando' }}</p>
          <p v-if="detalle" class="mt-1 text-xs leading-relaxed text-gray-500">{{ detalle }}</p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import FiguraAlcancia from './FiguraAlcancia.vue'

defineProps({
  visible: { type: Boolean, default: true },
  /** Qué se está haciendo, corto: «Registrando el pago», «Cargando socios». */
  texto: { type: String, default: '' },
  /** Una línea de contexto opcional debajo. */
  detalle: { type: String, default: '' },
  /** Variante sobre la página (velo salvia) para operaciones en curso. */
  flotante: { type: Boolean, default: false }
})
</script>

<style scoped>
.carga-caja-capa {
  touch-action: none;
  overscroll-behavior: contain;
  padding: max(1rem, env(safe-area-inset-top, 0px)) max(1rem, env(safe-area-inset-right, 0px))
    max(1rem, env(safe-area-inset-bottom, 0px)) max(1rem, env(safe-area-inset-left, 0px));
}

.carga-caja-fundido-enter-active { transition: opacity 0.2s ease-out; }
.carga-caja-fundido-leave-active { transition: opacity 0.25s ease-in; pointer-events: none; }
.carga-caja-fundido-enter-from,
.carga-caja-fundido-leave-to { opacity: 0; }
</style>

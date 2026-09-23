<template>
  <div class="switch-seg">
    <div
      class="switch-seg__pista"
      role="radiogroup"
      :aria-label="ariaLabel"
      :style="{ '--seg-n': opciones.length, '--seg-i': indiceActivo }"
      @keydown="alTeclado"
    >
      <span class="switch-seg__pulgar" aria-hidden="true" />
      <button
        v-for="(opcion, i) in opciones"
        :key="opcion.value"
        ref="botones"
        type="button"
        role="radio"
        :aria-checked="i === indiceActivo"
        :tabindex="i === indiceActivo ? 0 : -1"
        :disabled="disabled"
        :class="['switch-seg__opcion', i === indiceActivo ? 'is-activa' : '']"
        @click="elegir(i)"
      >{{ opcion.label }}</button>
    </div>
    <!-- Una sola línea de ayuda, la de la opción elegida: explica sin repetir las dos. -->
    <p v-if="opcionActiva?.ayuda" class="switch-seg__ayuda">{{ opcionActiva.ayuda }}</p>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  modelValue: { type: [String, Number], default: null },
  opciones: { type: Array, required: true }, // [{ value, label, ayuda? }]
  ariaLabel: { type: String, default: '' },
  disabled: { type: Boolean, default: false }
})
const emit = defineEmits(['update:modelValue'])

const botones = ref([])

const indiceActivo = computed(() => {
  const i = props.opciones.findIndex(o => o.value === props.modelValue)
  return i < 0 ? 0 : i
})
const opcionActiva = computed(() => props.opciones[indiceActivo.value])

function elegir(i) {
  if (props.disabled) return
  emit('update:modelValue', props.opciones[i].value)
}

// Flechas como en cualquier radiogroup nativo: mueven la selección y el foco.
function alTeclado(e) {
  const paso = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key]
  if (!paso) return
  e.preventDefault()
  const n = props.opciones.length
  const siguiente = (indiceActivo.value + paso + n) % n
  elegir(siguiente)
  botones.value[siguiente]?.focus()
}
</script>

<style scoped>
.switch-seg__pista {
  position: relative;
  display: grid;
  grid-template-columns: repeat(var(--seg-n), minmax(0, 1fr));
  padding: 0.25rem;
  border-radius: 9999px;
  background: #eef3ef;
  box-shadow: inset 0 1px 2px rgba(15, 23, 42, 0.08);
}
/* En móvil ocupa todo el ancho (blanco fácil para el dedo); en escritorio, estirado a
   lo ancho de la tarjeta, deja de leerse como un interruptor. */
@media (min-width: 640px) {
  .switch-seg__pista { max-width: 20rem; }
}

/* El pulgar se desliza con transform (GPU) en vez de animar `left`: en iOS la animación
   de propiedades de layout da tirones. */
.switch-seg__pulgar {
  position: absolute;
  top: 0.25rem;
  bottom: 0.25rem;
  left: 0.25rem;
  width: calc((100% - 0.5rem) / var(--seg-n));
  border-radius: 9999px;
  background: var(--brand-primary, #1B5E37);
  box-shadow: 0 2px 6px rgba(27, 94, 55, 0.35);
  -webkit-transform: translate3d(calc(100% * var(--seg-i)), 0, 0);
  transform: translate3d(calc(100% * var(--seg-i)), 0, 0);
  -webkit-transition: -webkit-transform 260ms cubic-bezier(0.34, 1.3, 0.64, 1);
  transition: transform 260ms cubic-bezier(0.34, 1.3, 0.64, 1);
}

.switch-seg__opcion {
  position: relative;
  z-index: 1;
  min-height: 2.75rem;
  padding: 0 0.75rem;
  border-radius: 9999px;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 0.875rem;
  color: #475569;
  background: transparent;
  cursor: pointer;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  transition: color 200ms ease;
  white-space: nowrap;
}
.switch-seg__opcion:hover:not(.is-activa):not(:disabled) { color: var(--brand-primary, #1B5E37); }
.switch-seg__opcion.is-activa { color: #fff; }
.switch-seg__opcion:disabled { cursor: not-allowed; opacity: 0.6; }
.switch-seg__opcion:focus-visible {
  outline: 2px solid var(--brand-primary, #1B5E37);
  outline-offset: 2px;
}

.switch-seg__ayuda {
  margin-top: 0.5rem;
  font-size: 0.75rem;
  line-height: 1.4;
  color: #64748b;
}

@media (prefers-reduced-motion: reduce) {
  .switch-seg__pulgar,
  .switch-seg__opcion { transition: none; }
}
</style>

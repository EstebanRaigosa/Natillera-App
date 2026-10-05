<template>
  <!--
    Una solicitud para usar la app: quién la pidió (nombre, correo y celular de la cuenta) y a
    qué socio quedará vinculada. El admin puede elegir otro socio antes de aprobar: el celular
    pudo coincidir con el de otro (p. ej. un número compartido en la familia).
    Se usa en el aviso global (SolicitudesVinculoModal) y en «Socios en la app» (Socios.vue).
  -->
  <li class="sol-item">
    <div class="flex items-start gap-3">
      <span class="sol-item__avatar" aria-hidden="true">{{ inicial }}</span>
      <div class="min-w-0 flex-1">
        <p class="sol-item__nombre">{{ solicitud.cuenta_nombre || 'Sin nombre' }}</p>
        <p class="sol-item__dato">
          <EnvelopeIcon class="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span class="truncate">{{ solicitud.cuenta_email || 'Sin correo' }}</span>
        </p>
        <p class="sol-item__dato">
          <DevicePhoneMobileIcon class="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span class="tabular-nums">{{ telefonoLegible(solicitud.cuenta_telefono) || 'Sin celular' }}</span>
        </p>
        <p v-if="natilleraNombre" class="sol-item__natillera">{{ natilleraNombre }}</p>
      </div>
    </div>

    <!-- A qué socio queda vinculada la cuenta -->
    <label class="sol-item__destino">
      <span class="sol-item__destino-etiqueta">
        <LinkIcon class="h-4 w-4" aria-hidden="true" />
        Se vinculará a
      </span>
      <select
        v-if="opciones.length > 0"
        v-model="socioElegido"
        class="sol-item__select"
        :disabled="ocupado"
        :aria-label="`Socio al que se vinculará la cuenta de ${solicitud.cuenta_email || 'esta persona'}`"
      >
        <option v-for="o in opciones" :key="o.id" :value="o.id" :disabled="o.vinculado && o.id !== solicitud.socio_id">
          {{ o.nombre }}{{ o.id === solicitud.socio_id ? ' (su celular)' : '' }}{{ o.vinculado && o.id !== solicitud.socio_id ? ' · ya usa la app' : '' }}
        </option>
      </select>
      <span v-else class="sol-item__socio-fijo">{{ solicitud.socio_nombre || 'Socio' }}</span>
    </label>
    <p v-if="socioElegido !== solicitud.socio_id" class="sol-item__aviso">
      Cambiaste el socio: el celular que escribió es el de {{ solicitud.socio_nombre || 'otro socio' }}.
    </p>

    <div class="mt-3 flex gap-2">
      <button type="button" class="sol-item__boton sol-item__boton--rechazar" :disabled="ocupado" @click="$emit('rechazar')">
        <XMarkIcon class="h-4 w-4" aria-hidden="true" />
        Rechazar
      </button>
      <button type="button" class="sol-item__boton sol-item__boton--aprobar" :disabled="ocupado" @click="$emit('aprobar', socioElegido)">
        <CheckIcon class="h-4 w-4" aria-hidden="true" />
        Aprobar
      </button>
    </div>
  </li>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { CheckIcon, DevicePhoneMobileIcon, EnvelopeIcon, LinkIcon, XMarkIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  /** Fila de solicitudes_vinculo con `socio_nombre` y `cuenta_telefono`. */
  solicitud: { type: Object, required: true },
  /** Socios de la natillera: [{ id, nombre, vinculado }]. Vacío = solo se muestra el socio. */
  socios: { type: Array, default: () => [] },
  ocupado: { type: Boolean, default: false },
  /** Solo en el aviso global, donde puede haber solicitudes de varias natilleras. */
  natilleraNombre: { type: String, default: '' }
})
defineEmits(['aprobar', 'rechazar'])

const socioElegido = ref(props.solicitud.socio_id)
watch(() => props.solicitud.socio_id, id => { socioElegido.value = id })

// El socio del celular va primero; luego los demás por nombre.
const opciones = computed(() => {
  if (props.socios.length === 0) return []
  const lista = [...props.socios].sort((a, b) => (a.nombre || '').localeCompare(b.nombre || '', 'es'))
  const i = lista.findIndex(o => o.id === props.solicitud.socio_id)
  if (i > 0) lista.unshift(...lista.splice(i, 1))
  return lista
})

const inicial = computed(() => (props.solicitud.cuenta_nombre || props.solicitud.cuenta_email || '?').trim().charAt(0).toUpperCase())

function telefonoLegible(tel) {
  const d = String(tel || '').replace(/\D/g, '').slice(-10)
  if (d.length !== 10) return tel || ''
  return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`
}
</script>

<style scoped>
.sol-item {
  padding: 0.875rem;
  border-radius: 1rem;
  border: 1px solid var(--surface-divider-strong, rgba(15, 23, 42, 0.12));
  background: #fff;
  list-style: none;
}
.sol-item__avatar {
  display: inline-flex;
  width: 2.5rem;
  height: 2.5rem;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  background: #e8f3ea;
  font-family: var(--font-display);
  font-weight: 800;
  color: #1B5E37;
}
.sol-item__nombre { font-weight: 800; font-size: 0.9375rem; line-height: 1.25; color: #0f172a; }
.sol-item__dato {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  margin-top: 0.125rem;
  font-size: 0.8125rem;
  color: #475569;
  min-width: 0;
}
.sol-item__dato svg { color: #94a3b8; }
.sol-item__natillera {
  display: inline-block;
  margin-top: 0.375rem;
  padding: 0.0625rem 0.5rem;
  border-radius: 9999px;
  background: #f1f5f9;
  font-size: 0.6875rem;
  font-weight: 700;
  color: #475569;
}
.sol-item__destino {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  margin-top: 0.75rem;
  padding: 0.625rem 0.75rem;
  border-radius: 0.875rem;
  background: #f4f8f5;
}
.sol-item__destino-etiqueta {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.6875rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #1B5E37;
}
/* 16 px: por debajo, iOS hace zoom al enfocar. Sin appearance:none (regla del proyecto). */
.sol-item__select {
  width: 100%;
  min-height: 2.75rem;
  padding: 0 0.75rem;
  border-radius: 0.75rem;
  border: 1px solid rgba(27, 94, 55, 0.3);
  background: #fff;
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  touch-action: manipulation;
}
.sol-item__select:focus-visible { outline: 2px solid #1B5E37; outline-offset: 1px; }
.sol-item__socio-fijo { font-weight: 800; color: #0f172a; }
.sol-item__aviso { margin-top: 0.375rem; font-size: 0.75rem; font-weight: 600; color: #b45309; }
.sol-item__boton {
  display: inline-flex;
  flex: 1 1 0%;
  min-height: 2.75rem;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 700;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}
.sol-item__boton--rechazar { background: #fef2f2; color: #b91c1c; }
.sol-item__boton--aprobar { flex-grow: 1.4; background: #1B5E37; color: #fff; }
.sol-item__boton:disabled { opacity: 0.5; }

/* ==========================================================================
   Modo oscuro (skill natillerapp-modo-oscuro). Propuesto con
   scripts/tema/proponer-oscuro.mjs y revisado a mano. Solo lo que cambia: las
   reglas de claro de arriba quedan intactas.
   ========================================================================== */
:where([data-tema=oscuro]) .sol-item:not(:where([data-tema=claro] *)) {
  background: var(--superficie-tarjeta);
}
:where([data-tema=oscuro]) .sol-item__avatar:not(:where([data-tema=claro] *)) {
  background: var(--marca-suave);
  color: var(--marca-tinta);
}
:where([data-tema=oscuro]) .sol-item__nombre:not(:where([data-tema=claro] *)) {
  color: var(--texto-fuerte);
}
:where([data-tema=oscuro]) .sol-item__dato:not(:where([data-tema=claro] *)) {
  color: var(--texto-medio);
}
:where([data-tema=oscuro]) .sol-item__dato svg:not(:where([data-tema=claro] *)) {
  color: var(--texto-tenue);
}
:where([data-tema=oscuro]) .sol-item__natillera:not(:where([data-tema=claro] *)) {
  background: var(--superficie-suave);
  color: var(--texto-medio);
}
:where([data-tema=oscuro]) .sol-item__destino:not(:where([data-tema=claro] *)) {
  background: var(--superficie-suave);
}
:where([data-tema=oscuro]) .sol-item__destino-etiqueta:not(:where([data-tema=claro] *)) {
  color: var(--marca-tinta);
}
:where([data-tema=oscuro]) .sol-item__select:not(:where([data-tema=claro] *)) {
  border: 1px solid var(--marca-tinta-borde);
  background: var(--superficie-tarjeta);
  color: var(--texto-fuerte);
}
:where([data-tema=oscuro]) .sol-item__socio-fijo:not(:where([data-tema=claro] *)) {
  color: var(--texto-fuerte);
}
:where([data-tema=oscuro]) .sol-item__aviso:not(:where([data-tema=claro] *)) {
  color: var(--alerta);
}
:where([data-tema=oscuro]) .sol-item__boton--rechazar:not(:where([data-tema=claro] *)) {
  background: var(--peligro-suave);
  color: var(--peligro);
}
</style>

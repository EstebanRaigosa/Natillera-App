<template>
  <!--
    Rol y nivel por opción (Nada / Ver / Gestionar). Se usa al invitar y al editar en la
    página de Administradores.

    Co-administrador y Visor son plantillas: la tabla muestra lo que dan. Si se cambia una
    opción, pasa a «Colaborador» (a la medida) con esa plantilla como punto de partida.
  -->
  <fieldset class="editor-rol">
    <legend class="ds-label">Rol</legend>
    <div class="editor-rol__opciones">
      <label
        v-for="(r, clave) in rolesVisibles"
        :key="clave"
        class="editor-rol__opcion"
        :class="{ 'is-activa': rol === clave }"
      >
        <input
          type="radio"
          class="sr-only"
          :name="nombreGrupo"
          :value="clave"
          :checked="rol === clave"
          @change="elegirRol(clave)"
        />
        <span class="editor-rol__nombre">{{ r.nombre }}</span>
        <span class="editor-rol__desc">{{ r.descripcion }}</span>
      </label>
    </div>

    <div class="editor-rol__tabla" role="group" aria-label="Permisos por opción">
      <div v-for="m in MODULOS" :key="m.clave" class="editor-rol__fila">
        <div class="min-w-0 flex-1">
          <p class="editor-rol__modulo">{{ m.nombre }}</p>
          <p class="editor-rol__detalle">{{ m.detalle }}</p>
        </div>
        <div class="editor-rol__niveles" role="radiogroup" :aria-label="`Nivel en ${m.nombre}`">
          <button
            v-for="n in m.niveles"
            :key="n"
            type="button"
            role="radio"
            class="editor-rol__nivel"
            :class="[`editor-rol__nivel--${n}`, { 'is-activo': nivelEfectivo(m.clave) === n }]"
            :aria-checked="nivelEfectivo(m.clave) === n"
            @click="elegirNivel(m.clave, n)"
          >
            {{ ETIQUETA_NIVEL[n] }}
          </button>
        </div>
      </div>
    </div>
  </fieldset>
</template>

<script setup>
import { computed } from 'vue'
import { MODULOS, ETIQUETA_NIVEL, NIVELES_COLABORADOR_INICIAL, nivelesDePermisos } from '../../permisos/modulos'
import { ROLES } from './roles'

const props = defineProps({
  rol: { type: String, required: true },
  /** { socios: 'ver', cuotas: 'gestionar', … } (solo cuenta para el rol colaborador) */
  niveles: { type: Object, default: () => ({}) },
  /** Nombre del grupo de radios: único por formulario (hay varios en la página). */
  nombreGrupo: { type: String, required: true },
  /** Solo el dueño crea co-administradores (la base de datos también lo exige). */
  permitirCoAdmin: { type: Boolean, default: true }
})
const emit = defineEmits(['update:rol', 'update:niveles'])

const rolesVisibles = computed(() =>
  props.permitirCoAdmin
    ? ROLES
    : Object.fromEntries(Object.entries(ROLES).filter(([clave]) => clave !== 'co_administrador'))
)

// Lo que de verdad da cada opción con el rol elegido.
const plantilla = computed(() => (props.rol === 'colaborador' ? null : nivelesDePermisos(props.rol, {})))
const nivelEfectivo = modulo => plantilla.value?.[modulo] ?? props.niveles?.[modulo] ?? NIVELES_COLABORADOR_INICIAL[modulo]

function elegirRol(clave) {
  // Al pasar a colaborador se parte de lo que se ve en la tabla, no de cero.
  if (clave === 'colaborador' && props.rol !== 'colaborador') {
    emit('update:niveles', { ...(plantilla.value || NIVELES_COLABORADOR_INICIAL) })
  }
  emit('update:rol', clave)
}

function elegirNivel(modulo, nivel) {
  if (props.rol !== 'colaborador') {
    emit('update:niveles', { ...plantilla.value, [modulo]: nivel })
    emit('update:rol', 'colaborador')
    return
  }
  emit('update:niveles', { ...props.niveles, [modulo]: nivel })
}
</script>

<style scoped>
.editor-rol { border: 0; margin: 0; padding: 0; min-width: 0; }
.editor-rol__opciones { display: flex; flex-direction: column; gap: 0.5rem; }
.editor-rol__opcion {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  min-height: 2.75rem;
  padding: 0.625rem 0.875rem;
  border: 1.5px solid var(--surface-divider-strong);
  border-radius: var(--radius-md);
  background: #fff;
  cursor: pointer;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  transition: border-color var(--transition-fast), background-color var(--transition-fast);
}
.editor-rol__opcion.is-activa { border-color: var(--brand-primary); background: var(--brand-primary-soft); }
.editor-rol__opcion:focus-within { box-shadow: 0 0 0 3px rgba(27, 94, 55, 0.18); }
.editor-rol__nombre { font-size: 0.9375rem; font-weight: 700; color: #0f172a; }
.editor-rol__desc { font-size: 0.8125rem; color: #64748b; }

.editor-rol__tabla {
  margin-top: 0.875rem;
  padding: 0.25rem 0.875rem;
  border-radius: var(--radius-md);
  background: #f8fafc;
}
.editor-rol__fila {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem 0.75rem;
  padding: 0.625rem 0;
}
.editor-rol__fila + .editor-rol__fila { border-top: 1px solid var(--surface-divider); }
.editor-rol__modulo { font-size: 0.875rem; font-weight: 700; color: #0f172a; }
.editor-rol__detalle { font-size: 0.75rem; color: #64748b; }

/* Control segmentado del DS, en pequeño: el nivel activo con su color */
.editor-rol__niveles {
  display: inline-flex;
  flex-shrink: 0;
  gap: 0.1875rem;
  padding: 0.1875rem;
  border: 1px solid var(--surface-divider);
  border-radius: 9999px;
  background: rgba(15, 23, 42, 0.05);
}
.editor-rol__nivel {
  min-height: 2.5rem;
  min-width: 3.5rem;
  padding: 0 0.625rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 700;
  color: #64748b;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  transition: background-color var(--transition-fast), color var(--transition-fast);
}
.editor-rol__nivel:focus-visible { outline: 2px solid var(--brand-primary); outline-offset: 1px; }
.editor-rol__nivel--nada.is-activo { background: #fff; color: #475569; box-shadow: 0 1px 2px rgba(15, 23, 42, 0.15); }
.editor-rol__nivel--ver.is-activo { background: #dbeafe; color: #1e40af; }
.editor-rol__nivel--gestionar.is-activo { background: var(--brand-primary); color: #fff; }

@media (prefers-reduced-motion: reduce) {
  .editor-rol__opcion,
  .editor-rol__nivel { transition: none; }
}

/* Modo oscuro: solo lo que cambia (skill natillerapp-modo-oscuro §2.5) */
:where([data-tema=oscuro]) .editor-rol__opcion { background: var(--superficie-tarjeta); }
:where([data-tema=oscuro]) .editor-rol__opcion.is-activa { border-color: var(--marca-tinta); background: var(--marca-suave); }
:where([data-tema=oscuro]) .editor-rol__nombre,
:where([data-tema=oscuro]) .editor-rol__modulo { color: var(--texto-fuerte); }
:where([data-tema=oscuro]) .editor-rol__desc,
:where([data-tema=oscuro]) .editor-rol__detalle,
:where([data-tema=oscuro]) .editor-rol__nivel { color: var(--texto-suave); }
:where([data-tema=oscuro]) .editor-rol__tabla { background: var(--superficie-suave); }
:where([data-tema=oscuro]) .editor-rol__niveles { background: rgb(255 255 255 / 0.06); }
:where([data-tema=oscuro]) .editor-rol__nivel--nada.is-activo { background: var(--superficie-elevada); color: var(--texto-medio); }
:where([data-tema=oscuro]) .editor-rol__nivel--ver.is-activo { background: var(--info-suave); color: var(--info); }
:where([data-tema=oscuro]) .editor-rol__opcion:focus-within { box-shadow: 0 0 0 3px var(--marca-tinta-borde); }
</style>

<template>
  <Teleport to="body">
    <TransitionGroup
      name="nati"
      tag="div"
      class="nati-stack"
      role="region"
      aria-label="Notificaciones"
    >
      <div
        v-for="notificacion in notifications"
        :key="notificacion.id"
        :class="[
          'nati',
          `nati--${normalizarVariante(notificacion.type)}`,
          { 'nati--quieta': pausados.has(notificacion.id), 'nati--arrastrando': !!arrastres[notificacion.id]?.activo }
        ]"
        :style="estiloArrastre(notificacion.id)"
        :role="esUrgente(notificacion.type) ? 'alert' : 'status'"
        :aria-live="esUrgente(notificacion.type) ? 'assertive' : 'polite'"
        @mouseenter="pausarSiHayPuntero(notificacion.id)"
        @mouseleave="reanudarSiHayPuntero(notificacion.id)"
        @focusin="pausar(notificacion.id)"
        @focusout="reanudar(notificacion.id)"
        @touchstart.passive="empezarArrastre(notificacion.id, $event)"
        @touchmove="moverArrastre(notificacion.id, $event)"
        @touchend="soltarArrastre(notificacion.id)"
        @touchcancel="soltarArrastre(notificacion.id)"
      >
        <span class="nati__aura" aria-hidden="true" />
        <span class="nati__asa" aria-hidden="true" />

        <div class="nati__icono">
          <component :is="iconoDe(notificacion.type)" class="h-5 w-5" />
        </div>

        <div class="nati__texto">
          <p v-if="notificacion.title" class="nati__titulo">{{ notificacion.title }}</p>
          <p v-if="notificacion.message" class="nati__mensaje">{{ notificacion.message }}</p>
        </div>

        <button
          type="button"
          class="nati__cerrar"
          :aria-label="`Cerrar ${notificacion.title || 'notificación'}`"
          @click="descartar(notificacion.id)"
        >
          <XMarkIcon class="h-4 w-4" />
        </button>

        <span
          v-if="notificacion.duration > 0"
          class="nati__tiempo"
          :style="{ animationDuration: `${notificacion.duration}ms` }"
          aria-hidden="true"
        />
      </div>
    </TransitionGroup>
  </Teleport>
</template>

<script setup>
import { computed, reactive } from 'vue'
import { useNotificationStore } from '../stores/notifications'
import {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'

const store = useNotificationStore()
const notifications = computed(() => store.notifications)

const ALIAS_VARIANTES = {
  success: 'exito',
  error: 'critica',
  warning: 'alerta',
  info: 'informacion'
}

const VARIANTES = ['exito', 'informacion', 'alerta', 'critica']

function normalizarVariante(tipo) {
  if (!tipo) return 'informacion'
  if (VARIANTES.includes(tipo)) return tipo
  return ALIAS_VARIANTES[tipo] || 'informacion'
}

function iconoDe(tipo) {
  return {
    exito: CheckCircleIcon,
    informacion: InformationCircleIcon,
    alerta: ExclamationTriangleIcon,
    critica: XCircleIcon
  }[normalizarVariante(tipo)]
}

function esUrgente(tipo) {
  const variante = normalizarVariante(tipo)
  return variante === 'critica' || variante === 'alerta'
}

function descartar(id) {
  store.remove(id)
}

/* --------------------------- Pausa del autocierre ---------------------------
   El puntero encima o el foco dentro significan que alguien está leyendo. Cerrar
   el aviso a media frase obliga a adivinar qué decía, así que el reloj se detiene
   —el de verdad, en el store— y la barra de tiempo se congela con él. */

const pausados = reactive(new Set())

/**
 * iOS dispara un `mouseenter` sintético después del tap y nunca el `mouseleave`
 * correspondiente, así que tocar el toast lo dejaría congelado para siempre. La
 * pausa por puntero solo tiene sentido donde hay puntero de verdad.
 */
function hayPunteroReal() {
  return typeof window !== 'undefined' && window.matchMedia?.('(hover: hover)').matches
}

function pausarSiHayPuntero(id) {
  if (!hayPunteroReal()) return
  pausar(id)
}

function reanudarSiHayPuntero(id) {
  if (!hayPunteroReal()) return
  reanudar(id)
}

function pausar(id) {
  pausados.add(id)
  store.pausar(id)
}

function reanudar(id) {
  pausados.delete(id)
  store.reanudar(id)
}

/* ------------------------ Deslizar hacia arriba para cerrar ------------------
   El toast entra por arriba, así que se va por donde vino. El botón de cerrar
   sigue estando para quien no descubra el gesto o navegue con teclado. */

const DISTANCIA_PARA_CERRAR = 56

const arrastres = reactive({})

function empezarArrastre(id, evento) {
  if (evento.touches.length !== 1) return
  arrastres[id] = { origen: evento.touches[0].clientY, dy: 0, activo: false }
  pausar(id)
}

function moverArrastre(id, evento) {
  const arrastre = arrastres[id]
  if (!arrastre || evento.touches.length !== 1) return

  // Solo cuenta el tirón hacia arriba; hacia abajo el toast no se mueve.
  arrastre.dy = Math.min(0, evento.touches[0].clientY - arrastre.origen)
  if (arrastre.dy > -4) return

  arrastre.activo = true
  // Sin esto la página scrollea por debajo y el gesto se pierde. Obliga a que el
  // handler sea no-pasivo, que es justo por lo que este `@touchmove` no lleva `.passive`.
  if (evento.cancelable) evento.preventDefault()
}

function soltarArrastre(id) {
  const arrastre = arrastres[id]
  if (!arrastre) return

  const sale = arrastre.dy <= -DISTANCIA_PARA_CERRAR
  // Se limpia antes de quitarlo: el `transform` en línea ganaría a la clase de
  // salida y dejaría la animación de cierre a medias.
  delete arrastres[id]
  pausados.delete(id)

  if (sale) {
    store.remove(id)
    return
  }
  store.reanudar(id)
}

function estiloArrastre(id) {
  const arrastre = arrastres[id]
  if (!arrastre || !arrastre.dy) return undefined
  return {
    transform: `translate3d(0, ${arrastre.dy}px, 0)`,
    opacity: String(1 - Math.min(1, -arrastre.dy / 140) * 0.55)
  }
}
</script>

<style scoped>
/* =========================================================================
   Nati-Notificación — toast del sistema de diseño Natillerapp

   Superficie de marca sólida con texto blanco: la misma firma que las cabeceras
   de modal (verde #1B5E37, icono en círculo blanco al 16 %, título en Mulish
   display). Cada variante cambia el fondo profundo y el color de su barra de
   tiempo, que es la señal rápida de qué clase de aviso es.
   ========================================================================= */

.nati-stack {
  position: fixed;
  z-index: 9999;
  top: max(1rem, env(safe-area-inset-top));
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.625rem;
  width: min(100vw - 2rem, 26rem);
  pointer-events: none;
}

@media (max-width: 480px) {
  .nati-stack {
    width: calc(100vw - 1.5rem);
    max-width: none;
  }
}

.nati {
  position: relative;
  pointer-events: auto;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: flex-start;
  gap: 0.75rem;
  width: 100%;
  padding: 0.9375rem 0.875rem 1rem 1rem;
  border-radius: var(--radius-lg, 1rem);
  border: 1px solid rgba(255, 255, 255, 0.14);
  background:
    linear-gradient(150deg, var(--nati-fondo) 0%, var(--nati-fondo-hondo) 100%);
  box-shadow:
    0 20px 44px -14px rgba(8, 40, 24, 0.55),
    0 6px 16px -6px rgba(15, 23, 42, 0.30);
  overflow: hidden;
  font-family: var(--font-body), system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  -webkit-tap-highlight-color: transparent;
  transform: translate3d(0, 0, 0);
  transition: transform 280ms cubic-bezier(0.32, 0.72, 0.20, 1), opacity 200ms ease;
}

/* Mientras el dedo manda, el toast va pegado a él y no interpola nada. */
.nati--arrastrando {
  transition: none;
}

/* Reflejo suave en la esquina superior: da volumen al verde plano, igual que
   en las cabeceras de modal. */
.nati__aura {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(
    110% 130% at 8% -20%,
    rgba(255, 255, 255, 0.16) 0%,
    rgba(255, 255, 255, 0.04) 45%,
    transparent 70%
  );
}

/* Asa de arrastre: solo insinúa el gesto donde el gesto existe. */
.nati__asa {
  display: none;
}

@media (pointer: coarse) {
  .nati__asa {
    display: block;
    position: absolute;
    top: 0.375rem;
    left: 50%;
    width: 2.25rem;
    height: 3px;
    border-radius: 9999px;
    background: rgba(255, 255, 255, 0.28);
    transform: translateX(-50%);
    pointer-events: none;
  }

  .nati {
    padding-top: 1.0625rem;
  }
}

.nati__icono {
  position: relative;
  flex-shrink: 0;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.16);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.22);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nati__texto {
  position: relative;
  min-width: 0;
  padding-right: 0.25rem;
}

.nati__titulo {
  font-family: var(--font-display), system-ui, sans-serif;
  font-size: 0.875rem;
  font-weight: 800;
  line-height: 1.3;
  letter-spacing: -0.01em;
  color: #fff;
  margin: 0;
  overflow-wrap: anywhere;
}

.nati__mensaje {
  font-size: 0.8125rem;
  font-weight: 400;
  line-height: 1.45;
  color: rgba(255, 255, 255, 0.82);
  margin: 0.1875rem 0 0;
  overflow-wrap: anywhere;
}

.nati__cerrar {
  position: relative;
  flex-shrink: 0;
  width: 1.75rem;
  height: 1.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  color: rgba(255, 255, 255, 0.65);
  background: transparent;
  border: 0;
  cursor: pointer;
  touch-action: manipulation;
  transition: background-color 150ms ease, color 150ms ease;
  margin-top: 0.1875rem;
}

/* El círculo mide 28 px porque más grande recarga la tarjeta, pero el dedo
   necesita 44. La diferencia va en un área invisible alrededor. */
.nati__cerrar::after {
  content: '';
  position: absolute;
  inset: -0.5rem;
}

.nati__cerrar:hover,
.nati__cerrar:focus-visible {
  background: rgba(255, 255, 255, 0.18);
  color: #fff;
  outline: none;
}

.nati__cerrar:focus-visible {
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.55);
}

.nati__cerrar:active {
  transform: scale(0.94);
}

/* Barra de tiempo: además de contar, es la marca de color de la variante. */
.nati__tiempo {
  position: absolute;
  inset: auto 0 0 0;
  height: 3px;
  background: var(--nati-pulso);
  transform-origin: left;
  animation-name: nati-tiempo;
  animation-timing-function: linear;
  animation-fill-mode: forwards;
}

.nati--quieta .nati__tiempo {
  animation-play-state: paused;
}

/* === Variantes ============================================================ */

.nati--informacion {
  --nati-fondo: #1B5E37;          /* verde bosque de marca */
  --nati-fondo-hondo: #14472a;
  --nati-pulso: #C8D9C8;          /* velo salvia del sistema */
}

.nati--exito {
  --nati-fondo: #0B6B41;
  --nati-fondo-hondo: #075132;
  --nati-pulso: #6EE7A8;
}

.nati--alerta {
  --nati-fondo: #8F5407;
  --nati-fondo-hondo: #6B3E04;
  --nati-pulso: #FBBF24;
}

.nati--critica {
  --nati-fondo: #A31C1C;
  --nati-fondo-hondo: #7C1414;
  --nati-pulso: #FCA5A5;
}

/* === Animaciones ========================================================= */

@keyframes nati-tiempo {
  from { transform: scaleX(1); }
  to   { transform: scaleX(0); }
}

/* Entrada con un pequeño rebote: cae desde arriba, se pasa un poco y asienta. */
@keyframes nati-entrada {
  0%   { opacity: 0; transform: translate3d(0, -150%, 0) scale(0.94); }
  62%  { opacity: 1; transform: translate3d(0, 5%, 0) scale(1.012); }
  100% { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
}

@-webkit-keyframes nati-entrada {
  0%   { opacity: 0; -webkit-transform: translate3d(0, -150%, 0) scale(0.94); }
  62%  { opacity: 1; -webkit-transform: translate3d(0, 5%, 0) scale(1.012); }
  100% { opacity: 1; -webkit-transform: translate3d(0, 0, 0) scale(1); }
}

@keyframes nati-icono {
  0%   { opacity: 0; transform: scale(0.45); }
  100% { opacity: 1; transform: scale(1); }
}

@-webkit-keyframes nati-icono {
  0%   { opacity: 0; -webkit-transform: scale(0.45); }
  100% { opacity: 1; -webkit-transform: scale(1); }
}

.nati-enter-active {
  animation: nati-entrada 420ms cubic-bezier(0.22, 1.15, 0.36, 1) both;
}

.nati-enter-active .nati__icono {
  animation: nati-icono 460ms cubic-bezier(0.22, 1.35, 0.36, 1) 90ms both;
}

.nati-leave-active {
  transition:
    transform 240ms cubic-bezier(0.4, 0, 1, 1),
    opacity 200ms ease-in;
  /* Sale del flujo para que las de abajo suban sin esperar. `left/right: 0`
     y no el truco de `translateX(-50%)`: la pila ya es el bloque contenedor,
     y así la animación de salida no compite con el centrado. */
  position: absolute;
  left: 0;
  right: 0;
  width: 100%;
}

.nati-leave-to {
  opacity: 0;
  transform: translate3d(0, -55%, 0) scale(0.96);
}

.nati-move {
  transition: transform 280ms cubic-bezier(0.32, 0.72, 0.20, 1);
}

/* iOS / Safari: la tarjeta anima transform y contiene hijos absolutos; forzar
   la capa GPU evita que el reflejo y la barra de tiempo se descoloquen. */
@supports (-webkit-touch-callout: none) {
  .nati {
    -webkit-transform: translate3d(0, 0, 0);
  }
  .nati__tiempo {
    -webkit-transform: scaleX(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .nati,
  .nati-move {
    transition: opacity 120ms linear;
  }
  .nati-enter-active,
  .nati-enter-active .nati__icono {
    animation: none;
  }
  .nati-leave-active {
    transition: opacity 120ms linear;
  }
  .nati-leave-to {
    transform: none;
  }
  .nati__tiempo {
    display: none;
  }
}
</style>

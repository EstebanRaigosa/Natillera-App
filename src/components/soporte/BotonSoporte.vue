<template>
  <!--
    Botón flotante de soporte.

    §7.1 de la especificación lo descartaba por tres motivos concretos, y los
    tres se resuelven aquí en vez de ignorarlos:

      · «compite con la barra inferior» → el arrastre está acotado por una zona
        segura que descuenta la barra inferior cuando existe y el safe-area del
        dispositivo, así que no puede quedar debajo de ella.
      · «compite con los pies de las modales» → se esconde solo mientras hay una
        modal abierta, usando `isBodyScrollLocked`, que es la señal que ya emite
        `useBodyScrollLock` para toda la app.
      · «obliga a lógica de ocultamiento que se rompe» → la única lógica es esa
        señal, más las rutas donde el botón no tiene sentido. Nada de detectar
        scroll ni de adivinar.
  -->
  <Teleport to="body">
    <Transition name="boton-soporte">
      <div
        v-if="seMuestra"
        ref="raiz"
        class="boton-soporte"
        :class="[arrastrando ? 'boton-soporte--arrastrando' : '', menuAbierto ? 'boton-soporte--menu' : '']"
        :style="estilo"
      >
        <!--
          Acciones. Para quien atiende el soporte, un solo toque no basta: tiene
          dos destinos distintos —sus mensajes y la bandeja de todos— y elegir
          por él sería adivinar. Para el resto, el toque abre el chat directo y
          este menú solo aparece manteniendo pulsado, con «Ocultar».
        -->
        <Transition name="boton-soporte-menu">
          <div v-if="menuAbierto" class="boton-soporte__menu" :class="ladoMenu">
            <button
              v-if="soporte.esSoporte"
              type="button"
              class="boton-soporte__accion"
              @click.stop="elegir('abrir')"
            >
              <ChatBubbleOvalLeftEllipsisIcon class="h-4 w-4 text-[#1B5E37]" />
              Mis mensajes
            </button>
            <button
              v-if="soporte.esSoporte"
              type="button"
              class="boton-soporte__accion"
              @click.stop="elegir('abrir-panel')"
            >
              <InboxIcon class="h-4 w-4 text-[#1B5E37]" />
              Panel de soporte
              <span v-if="noLeidos > 0" class="boton-soporte__cuenta">{{ noLeidos }}</span>
            </button>
            <button type="button" class="boton-soporte__accion" @click.stop="ocultarBoton">
              <EyeSlashIcon class="h-4 w-4" />
              Ocultar
            </button>
          </div>
        </Transition>

        <button
          type="button"
          class="boton-soporte__pastilla"
          :aria-label="etiqueta"
          :title="etiqueta"
          @pointerdown="alPulsar"
          @contextmenu.prevent="menuAbierto = true"
        >
          <ChatBubbleOvalLeftEllipsisIcon class="h-7 w-7" />
          <span v-if="noLeidos > 0" class="boton-soporte__insignia">{{ noLeidos > 99 ? '99+' : noLeidos }}</span>
          <span v-if="noLeidos > 0" class="boton-soporte__pulso" aria-hidden="true" />
        </button>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { EyeSlashIcon, InboxIcon } from '@heroicons/vue/24/outline'
// Solid, no outline: sobre el círculo verde macizo el trazo fino se pierde, y
// aquí el icono es lo único que identifica el botón (CLAUDE.md admite solid
// cuando aporta contraste).
import { ChatBubbleOvalLeftEllipsisIcon } from '@heroicons/vue/24/solid'
import { isBodyScrollLocked } from '../../composables/useBodyScrollLock'
import { useBotonSoporte } from '../../composables/useBotonSoporte'
import { useSoporteStore } from '../../stores/soporte'
import { useNotificationStore } from '../../stores/notifications'

const props = defineProps({
  /** true cuando la barra inferior de la natillera está en pantalla */
  hayBarraInferior: { type: Boolean, default: false },
})

// El botón no navega: abre el panel de chat sobre la pantalla en la que estás.
const emit = defineEmits(['abrir', 'abrir-panel'])

const route = useRoute()
const soporte = useSoporteStore()
const notificaciones = useNotificationStore()
const { estado, ocultar } = useBotonSoporte()

const TAMANO = 56          // px del botón
const MARGEN = 16          // separación con el borde

/*
 * A partir de `xl` (1280 px) la barra lateral del dashboard es estática y ocupa
 * 288 px (`w-72` del `<aside>` en DashboardLayout). El botón no debe poder
 * meterse debajo de ella: su límite izquierdo es el borde derecho de la barra.
 * Por debajo de ese ancho la barra es un cajón que se superpone, y entonces el
 * límite vuelve a ser el borde de la pantalla.
 */
const ANCHO_BARRA_LATERAL = 288
const PX_BARRA_LATERAL_FIJA = 1280
const UMBRAL_ARRASTRE = 8  // px a partir de los cuales es arrastre y no toque
const MS_PULSACION_LARGA = 450

const raiz = ref(null)
const arrastrando = ref(false)
const menuAbierto = ref(false)
const posicionLibre = ref(null)  // {x, y} solo mientras se arrastra

// `window.innerWidth/innerHeight` no son reactivos: sin esta medida el botón se
// quedaría colocado según el tamaño que tenía la ventana al montarse.
const medida = ref({ ancho: 0, alto: 0 })

const ladoMenu = computed(() => estado.lado)

const noLeidos = computed(() => soporte.noLeidos)

const etiqueta = computed(() =>
  noLeidos.value > 0
    ? `Soporte · ${noLeidos.value} mensaje${noLeidos.value === 1 ? '' : 's'} sin leer`
    : 'Soporte')

/**
 * Dónde NO debe aparecer: dentro del propio soporte (sería un botón para ir a
 * donde ya estás) y mientras hay una modal abierta.
 */
const seMuestra = computed(() => {
  if (!estado.visible) return false
  if (isBodyScrollLocked.value) return false
  if (route.path.startsWith('/soporte') || route.path.startsWith('/admin/soporte')) return false
  return true
})

// --- Zona segura: dónde se le permite estar -------------------------------

function zonaSegura() {
  const alto = medida.value.alto || window.innerHeight
  const ancho = medida.value.ancho || window.innerWidth
  // La barra inferior de la natillera mide ~4.5rem; se le suma el safe-area.
  const reservaAbajo = props.hayBarraInferior ? 88 : 24
  const bordeIzquierdo = ancho >= PX_BARRA_LATERAL_FIJA ? ANCHO_BARRA_LATERAL : 0

  return {
    minY: 72,                                   // por debajo de la cabecera móvil
    maxY: alto - TAMANO - reservaAbajo,
    minX: bordeIzquierdo + MARGEN,
    maxX: ancho - TAMANO - MARGEN,
  }
}

const estilo = computed(() => {
  if (posicionLibre.value) {
    return {
      transform: `translate3d(${posicionLibre.value.x}px, ${posicionLibre.value.y}px, 0)`,
      transition: 'none',
    }
  }
  // En reposo, el botón vive pegado a un lado y a una altura relativa, así que
  // sobrevive a rotaciones y cambios de tamaño.
  // Leer `medida` aquí es lo que ata este computed al tamaño de la ventana.
  if (!medida.value.alto) return { transform: 'translate3d(-200px, 0, 0)' }
  const zona = zonaSegura()
  const x = estado.lado === 'izquierda' ? zona.minX : zona.maxX
  const y = zona.minY + (zona.maxY - zona.minY) * estado.altura
  return { transform: `translate3d(${x}px, ${Math.round(y)}px, 0)` }
})

// --- Arrastre --------------------------------------------------------------

let inicio = null
let temporizadorPulsacion = null

function alPulsar(evento) {
  // Solo botón principal / dedo
  if (evento.button != null && evento.button !== 0) return

  const zona = zonaSegura()
  const actualX = estado.lado === 'izquierda' ? zona.minX : zona.maxX
  const actualY = zona.minY + (zona.maxY - zona.minY) * estado.altura

  inicio = {
    puntero: { x: evento.clientX, y: evento.clientY },
    boton: { x: actualX, y: actualY },
    movido: false,
  }

  evento.currentTarget.setPointerCapture?.(evento.pointerId)

  // Mantener pulsado abre las acciones (ocultar). En escritorio, el clic
  // derecho hace lo mismo.
  temporizadorPulsacion = setTimeout(() => {
    if (inicio && !inicio.movido) {
      menuAbierto.value = true
      // Se marca para que el `pointerup` que viene detrás no lo cierre en el
      // acto: sin esto, mantener pulsado abría y cerraba el menú de golpe.
      inicio.abrioMenu = true
      if (navigator.vibrate) navigator.vibrate(8)
    }
  }, MS_PULSACION_LARGA)

  window.addEventListener('pointermove', alMover)
  window.addEventListener('pointerup', alSoltar)
  window.addEventListener('pointercancel', alSoltar)
}

function alMover(evento) {
  if (!inicio) return

  const dx = evento.clientX - inicio.puntero.x
  const dy = evento.clientY - inicio.puntero.y

  if (!inicio.movido && Math.hypot(dx, dy) < UMBRAL_ARRASTRE) return

  inicio.movido = true
  arrastrando.value = true
  menuAbierto.value = false
  clearTimeout(temporizadorPulsacion)

  const zona = zonaSegura()
  posicionLibre.value = {
    x: Math.min(zona.maxX, Math.max(zona.minX, inicio.boton.x + dx)),
    y: Math.min(zona.maxY, Math.max(zona.minY, inicio.boton.y + dy)),
  }
}

function alSoltar() {
  clearTimeout(temporizadorPulsacion)
  window.removeEventListener('pointermove', alMover)
  window.removeEventListener('pointerup', alSoltar)
  window.removeEventListener('pointercancel', alSoltar)

  const hubo = inicio?.movido
  const abrioMenu = inicio?.abrioMenu
  const suelta = posicionLibre.value
  inicio = null
  arrastrando.value = false
  posicionLibre.value = null

  if (!hubo) {
    if (abrioMenu) return                            // acaba de abrirse: se queda abierto
    if (menuAbierto.value) menuAbierto.value = false // segundo toque: se cierra
    else if (soporte.esSoporte) menuAbierto.value = true  // tiene dos destinos: que elija
    else emit('abrir')                               // toque limpio: abre el chat
    return
  }

  if (!suelta) return

  // Al soltar se pega al borde más cercano, como una pestaña. Dejarlo suelto en
  // mitad de la pantalla tapa contenido y se ve descuidado.
  const zona = zonaSegura()
  const centro = suelta.x + TAMANO / 2
  // El punto medio se mide sobre el área útil, no sobre la ventana: con la barra
  // lateral abierta, el centro visual está desplazado a la derecha.
  const medio = zona.minX + (zona.maxX - zona.minX) / 2
  estado.lado = centro < medio ? 'izquierda' : 'derecha'
  const recorrido = Math.max(1, zona.maxY - zona.minY)
  estado.altura = Math.min(1, Math.max(0, (suelta.y - zona.minY) / recorrido))
}

function elegir(evento) {
  menuAbierto.value = false
  emit(evento)
}

function ocultarBoton() {
  menuAbierto.value = false
  ocultar()
  notificaciones.informacion('Puedes volver a mostrarlo desde Configuración.', 'Botón de soporte oculto')
}

// El menú se cierra al tocar en cualquier otro sitio.
function alTocarFuera(evento) {
  if (!menuAbierto.value) return
  if (raiz.value && !raiz.value.contains(evento.target)) menuAbierto.value = false
}

function alRedimensionar() {
  medida.value = { ancho: window.innerWidth, alto: window.innerHeight }
}

onMounted(() => {
  alRedimensionar()
  document.addEventListener('pointerdown', alTocarFuera)
  window.addEventListener('resize', alRedimensionar)
  window.addEventListener('orientationchange', alRedimensionar)
})

onBeforeUnmount(() => {
  clearTimeout(temporizadorPulsacion)
  document.removeEventListener('pointerdown', alTocarFuera)
  window.removeEventListener('resize', alRedimensionar)
  window.removeEventListener('orientationchange', alRedimensionar)
  window.removeEventListener('pointermove', alMover)
  window.removeEventListener('pointerup', alSoltar)
  window.removeEventListener('pointercancel', alSoltar)
})
</script>

<style scoped>
.boton-soporte {
  position: fixed;
  top: 0;
  left: 0;
  /* Por debajo de las modales (z-50+) y por encima del contenido y de la barra
     inferior, de la que además se aparta con la zona segura. */
  z-index: 45;
  width: 56px;
  height: 56px;
  transition: transform 0.28s cubic-bezier(0.22, 1, 0.36, 1);
  /* Sin esto, arrastrar el botón hace scroll de la página en móvil. */
  touch-action: none;
  -webkit-tap-highlight-color: transparent;
}

.boton-soporte--arrastrando {
  transition: none;
}

.boton-soporte__pastilla {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;   /* muy por encima del mínimo táctil de 44 px */
  height: 56px;
  border-radius: 9999px;
  color: #fff;
  background: linear-gradient(145deg, #24784a 0%, #1b5e37 55%, #164b2c 100%);
  border: 1px solid rgba(255, 255, 255, 0.22);
  box-shadow:
    0 10px 24px -8px rgba(20, 70, 42, 0.55),
    0 4px 10px -4px rgba(0, 0, 0, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.18);
  cursor: grab;
  touch-action: none;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
  /* Fuerza capa propia: el arrastre va fluido también en iOS. */
  transform: translate3d(0, 0, 0);
}

.boton-soporte__pastilla:hover {
  transform: translate3d(0, -1px, 0) scale(1.04);
  box-shadow:
    0 14px 30px -8px rgba(20, 70, 42, 0.6),
    0 6px 14px -4px rgba(0, 0, 0, 0.28),
    inset 0 1px 0 rgba(255, 255, 255, 0.22);
}

.boton-soporte__pastilla:active {
  cursor: grabbing;
  transform: scale(0.96);
}

.boton-soporte--arrastrando .boton-soporte__pastilla {
  cursor: grabbing;
  transform: scale(1.08);
  box-shadow:
    0 18px 36px -8px rgba(20, 70, 42, 0.65),
    0 8px 18px -6px rgba(0, 0, 0, 0.3);
}

.boton-soporte__insignia {
  position: absolute;
  top: -2px;
  right: -2px;
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  background: #dc2626;
  border: 2px solid #fff;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}

/* Halo que late solo cuando hay algo sin leer: llama la atención sin ruido. */
.boton-soporte__pulso {
  position: absolute;
  inset: -4px;
  border-radius: 9999px;
  border: 2px solid rgba(27, 94, 55, 0.45);
  animation: boton-soporte-pulso 2.4s ease-out infinite;
  pointer-events: none;
}

@keyframes boton-soporte-pulso {
  0%   { transform: scale(1);    opacity: 0.7; }
  70%  { transform: scale(1.35); opacity: 0; }
  100% { transform: scale(1.35); opacity: 0; }
}

@-webkit-keyframes boton-soporte-pulso {
  0%   { -webkit-transform: scale(1);    opacity: 0.7; }
  70%  { -webkit-transform: scale(1.35); opacity: 0; }
  100% { -webkit-transform: scale(1.35); opacity: 0; }
}

.boton-soporte__menu {
  position: absolute;
  bottom: 64px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.boton-soporte__menu.izquierda { left: 0; }
.boton-soporte__menu.derecha   { right: 0; }

.boton-soporte__accion {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 44px;
  padding: 0 14px;
  border-radius: 9999px;
  background: #fff;
  border: 1px solid rgb(229 231 235);
  box-shadow: 0 8px 20px -8px rgba(0, 0, 0, 0.28);
  color: rgb(55 65 81);
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  touch-action: manipulation;
}

.boton-soporte__accion:hover {
  background: rgb(249 250 251);
}

.boton-soporte__cuenta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 9999px;
  background: #dc2626;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

/* Entrada y salida */
.boton-soporte-enter-active,
.boton-soporte-leave-active {
  transition: opacity 0.2s ease, scale 0.2s ease;
}

.boton-soporte-enter-from,
.boton-soporte-leave-to {
  opacity: 0;
  scale: 0.8;
}

.boton-soporte-menu-enter-active,
.boton-soporte-menu-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.boton-soporte-menu-enter-from,
.boton-soporte-menu-leave-to {
  opacity: 0;
  transform: translateY(6px);
}

/* Quien pide menos movimiento, menos movimiento. */
@media (prefers-reduced-motion: reduce) {
  .boton-soporte,
  .boton-soporte__pastilla,
  .boton-soporte-enter-active,
  .boton-soporte-leave-active {
    transition: none;
  }
  .boton-soporte__pulso {
    animation: none;
  }
}
</style>

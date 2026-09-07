<template>
  <ModalWrapper
    :show="visible"
    :z-index="50"
    align="bottom"
    :persistent="true"
    :ios-soft-backdrop="true"
    overlay-class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden overscroll-contain"
    backdrop-class="absolute inset-0 bg-[#C8D9C8]/70 backdrop-blur-[2px]"
    card-class="relative w-full sm:max-w-md max-h-[90dvh] sm:max-h-[90vh] flex flex-col min-h-0 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border border-gray-200/60 bg-white"
    card-max-width="28rem"
    @close="ahoraNo"
  >
    <!-- Cabecera móvil: una sola fila (icono + textos + X) -->
    <div class="flex-shrink-0 bg-[#1B5E37] px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:hidden">
      <div class="flex min-h-[4.2rem] items-center gap-3">
        <div class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/15">
          <BellAlertIcon class="h-5 w-5 text-white" />
        </div>
        <div class="min-w-0 flex-1">
          <h2 class="font-display text-base font-bold leading-tight text-white">¿Te avisamos?</h2>
          <p class="mt-0.5 text-[0.6875rem] leading-snug text-white/80">Notificaciones en este dispositivo</p>
        </div>
        <button
          type="button"
          class="flex h-11 w-11 flex-shrink-0 touch-manipulation items-center justify-center rounded-full text-white/90 hover:bg-white/10"
          aria-label="Cerrar"
          :disabled="ocupado"
          @click="ahoraNo"
        >
          <XMarkIcon class="h-5 w-5" />
        </button>
      </div>
    </div>

    <!-- Cabecera desktop: icono arriba, textos centrados, X en la tercera columna del flex -->
    <div class="hidden flex-shrink-0 bg-[#1B5E37] px-6 pb-5 pt-[max(1rem,env(safe-area-inset-top))] sm:block">
      <div class="flex items-start">
        <div class="w-11 flex-shrink-0" aria-hidden="true" />
        <div class="flex min-w-0 flex-1 flex-col items-center text-center">
          <div class="mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-white/15">
            <BellAlertIcon class="h-6 w-6 text-white" />
          </div>
          <h2 class="font-display text-lg font-bold leading-tight text-white">¿Te avisamos?</h2>
          <p class="mt-1 text-xs leading-snug text-white/80">Notificaciones en este dispositivo</p>
        </div>
        <button
          type="button"
          class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-white/90 hover:bg-white/10"
          aria-label="Cerrar"
          :disabled="ocupado"
          @click="ahoraNo"
        >
          <XMarkIcon class="h-5 w-5" />
        </button>
      </div>
    </div>

    <div class="relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <div
        ref="scrollRef"
        class="flex-1 min-h-0 space-y-4 overflow-y-auto overflow-x-hidden bg-white px-5 pb-4 pt-5 overscroll-contain [-webkit-overflow-scrolling:touch] sm:px-6"
        @scroll.passive="onScroll"
      >
        <p class="text-sm leading-relaxed text-gray-700">
          Ya tienes Natillerapp instalada. Si nos das permiso, te avisamos
          <span class="font-semibold">cuando el soporte responda</span> a tus mensajes, sin que
          tengas que entrar a mirar.
        </p>

        <div class="flex items-start gap-3 rounded-xl bg-[#E8F5E9] p-3.5 ring-1 ring-[#1B5E37]/15">
          <DevicePhoneMobileIcon class="mt-0.5 h-5 w-5 flex-shrink-0 text-[#1B5E37]" />
          <p class="min-w-0 text-xs leading-relaxed text-gray-700">
            El permiso vale solo para <span class="font-semibold">este dispositivo</span>. Puedes
            activarlo o quitarlo cuando quieras desde <span class="font-semibold">Mi cuenta</span>.
          </p>
        </div>

        <p class="text-xs leading-relaxed text-gray-500">
          Al aceptar, el navegador te preguntará a su vez: hay que responderle que sí para que
          los avisos queden activos.
        </p>

        <!-- Qué se está esperando. Sin esto, el botón dice «Activando…» sin explicar a qué. -->
        <p v-if="pista" class="flex items-start gap-1.5 text-xs leading-relaxed text-gray-500">
          <span class="mt-1 inline-block size-1.5 shrink-0 animate-pulse rounded-full bg-[#1B5E37]" />
          <span>{{ pista }}</span>
        </p>
        <p v-if="error" class="text-xs leading-relaxed text-red-600">{{ error }}</p>
      </div>

      <NatiscrollHint :show="hayMas" />
    </div>

    <!-- Footer de acciones fijo. Safe-area para el home indicator, más lo que la barra de
         Safari tape por debajo (`env()` no la describe; se mide con el visual viewport). -->
    <div
      class="flex-shrink-0 space-y-3 border-t border-gray-200 bg-white px-5 pt-4 sm:px-6"
      :style="{ paddingBottom: `calc(max(1.25rem, env(safe-area-inset-bottom, 0px)) + ${tapado}px)` }"
    >
      <!--
        El permiso se pide desde ESTA pulsación y nada más: `activar()` llega a
        `Notification.requestPermission()` sin ningún `await` por delante. Si se colara uno,
        Safari daría el gesto por perdido y denegaría el permiso sin preguntar.
      -->
      <button
        type="button"
        class="btn-modal-primary w-full"
        :disabled="ocupado"
        @click="aceptar"
      >
        {{ ocupado ? 'Activando…' : 'Sí, quiero los avisos' }}
      </button>
      <button
        type="button"
        class="btn-modal-secondary w-full"
        :disabled="ocupado"
        @click="ahoraNo"
      >
        Ahora no
      </button>
    </div>
  </ModalWrapper>
</template>

<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { BellAlertIcon, DevicePhoneMobileIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import ModalWrapper from './ModalWrapper.vue'
import NatiscrollHint from './NatiscrollHint.vue'
import { usePush } from '../composables/usePush'
import { useBodyScrollLock } from '../composables/useBodyScrollLock'
import { useNatiscroll } from '../composables/useNatiscroll'
import { useTapadoInferior } from '../composables/useTapadoInferior'
import { useAuthStore } from '../stores/auth'
import { useNotificationStore } from '../stores/notifications'

/**
 * Ofrecimiento de notificaciones al instalar la PWA.
 *
 * Es la única vez que la app propone activar los avisos por su cuenta; el resto del tiempo
 * se hace desde «Mi cuenta». Aquí tiene sentido porque en iPhone el push **solo** funciona
 * con la app instalada (iOS >= 16.4), así que es justo el momento en que pasa a ser posible.
 *
 * Lo que no se hace, a propósito: pedir el permiso al arrancar. Sin una pulsación de por
 * medio, la mayoría de navegadores lo deniegan de forma permanente y dejan al usuario sin la
 * opción. De ahí que esto sea un modal con un botón, y no una llamada en `onMounted`.
 */

const CLAVE_PREGUNTADO = 'natillerapp:aviso-notificaciones-pwa'
/** Margen tras el arranque: encima de la pantalla de carga nadie lee el aviso. */
const MS_ESPERA = 2500

const { estado, ocupado, error, pista, soportado, configurado, activar, estaInstalada } = usePush()
const auth = useAuthStore()
const notificaciones = useNotificationStore()

const visible = ref(false)
const recienInstalada = ref(false)
let temporizador = null

useBodyScrollLock(visible)
const { scrollRef, hayMas, onScroll } = useNatiscroll(visible)
// El pie va anclado abajo: en iOS la barra de Safari lo tapa y `env()` no la describe.
const { tapado } = useTapadoInferior()

function yaSePregunto() {
  try {
    return localStorage.getItem(CLAVE_PREGUNTADO) === '1'
  } catch {
    // Modo privado o storage bloqueado: se preferirá preguntar de más a no preguntar.
    return false
  }
}

function anotarQueSePregunto() {
  try {
    localStorage.setItem(CLAVE_PREGUNTADO, '1')
  } catch { /* sin storage no hay memoria; el modal volverá a salir */ }
}

/**
 * Salida de emergencia para probarlo sin reinstalar la app: `?avisos=1` en la URL se salta
 * la memoria de «ya se preguntó» y el requisito de estar instalada. Lo que no se salta es
 * el estado del permiso: si el navegador ya respondió, no hay nada que preguntar.
 */
function seFuerzaPorUrl() {
  if (typeof window === 'undefined') return false
  return new URLSearchParams(window.location.search).get('avisos') === '1'
}

function sePuedePreguntar() {
  if (visible.value) return false
  const forzado = seFuerzaPorUrl()
  if (!forzado && yaSePregunto()) return false
  // Sin sesión no hay dónde guardar la suscripción, y encima del modal del nombre
  // quedarían dos overlays apilados en el primer arranque.
  if (!auth.isAuthenticated || auth.needsUsername) return false
  if (!forzado && !estaInstalada() && !recienInstalada.value) return false
  if (!soportado.value || !configurado.value) return false
  // 'granted' o 'denied' ya son una respuesta: el navegador no vuelve a preguntar y
  // repetirlo aquí solo estorba. Lo de revertir un «no» se explica en «Mi cuenta».
  return Notification.permission === 'default'
}

function programarAviso() {
  if (temporizador) clearTimeout(temporizador)
  temporizador = setTimeout(() => {
    temporizador = null
    if (sePuedePreguntar()) visible.value = true
  }, MS_ESPERA)
}

/**
 * Android/Chrome avisan de la instalación con la app aún abierta en la pestaña, donde
 * `display-mode` todavía no es standalone; de ahí esta bandera. iOS no dispara el evento:
 * allí el aviso sale la primera vez que se abre desde la pantalla de inicio.
 */
function alInstalar() {
  recienInstalada.value = true
  programarAviso()
}

onMounted(() => {
  window.addEventListener('appinstalled', alInstalar)
  programarAviso()
})

onUnmounted(() => {
  window.removeEventListener('appinstalled', alInstalar)
  if (temporizador) clearTimeout(temporizador)
})

// Si la sesión entra después del arranque (login, o restauración lenta), se reintenta.
watch(() => [auth.isAuthenticated, auth.needsUsername], () => {
  if (auth.isAuthenticated && !auth.needsUsername) programarAviso()
})

async function aceptar() {
  anotarQueSePregunto()
  const listo = await activar()

  if (listo) {
    visible.value = false
    notificaciones.exito('Avisos activados en este dispositivo.')
    return
  }

  if (estado.value === 'denegado') {
    visible.value = false
    notificaciones.alerta('El navegador bloqueó los avisos. Puedes permitirlos desde los ajustes del sitio.')
    return
  }

  // Cualquier otro fallo (service worker, red, servicio push) deja el modal abierto con el
  // motivo a la vista: es reintentable y cerrarlo obligaría a ir a buscarlo a «Mi cuenta».
}

function ahoraNo() {
  if (ocupado.value) return
  anotarQueSePregunto()
  visible.value = false
}
</script>

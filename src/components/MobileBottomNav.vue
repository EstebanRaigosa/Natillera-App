<template>
  <nav
    v-if="natilleraId"
    id="tour-mobile-bottom-nav"
    class="mobile-bottom-nav mobile-bottom-nav--shell lg:hidden fixed bottom-0 left-0 right-0 z-[49] app-shell-nav-bg rounded-t-3xl pt-3 overflow-visible shadow-[0_-4px_24px_rgba(0,0,0,0.25)] transition-transform duration-300 ease-out"
    :class="[
      forceHidden ? 'translate-y-[110%] pointer-events-none opacity-0' : 'translate-y-0 opacity-100',
      destacarBarra && !forceHidden ? 'mobile-bottom-nav--destacar' : ''
    ]"
    :style="{ '--tapado-inferior': tapadoInferior + 'px' }"
  >
    <!-- Haz de brillo que barre a través de las opciones durante la animación de atención -->
    <div
      v-if="destacarBarra && !forceHidden"
      class="pointer-events-none absolute inset-x-0 top-0 bottom-0 rounded-t-3xl overflow-hidden z-[2]"
      aria-hidden="true"
    >
      <div class="mobile-bottom-nav__shine"></div>
    </div>
    <!--
      Opciones de «Caja», en la propia barra. Antes abrían una hoja a pantalla completa
      para elegir entre dos cosas: demasiada ceremonia para dos destinos. Ahora salen
      como dos iconos justo encima del espacio que las agrupa, y se van igual de rápido.

      Van DENTRO del <nav> a propósito: hereda su z-49, que está por encima del botón de
      chat (45) y del de «Volver arriba» (40), así el desplegable nunca queda debajo de
      ninguno de los dos. Sacarlo del nav lo dejaría a merced del z-index de cada vista.
    -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 translate-y-2 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 translate-y-2 scale-95"
    >
      <div
        v-if="menuCajaAbierto"
        ref="menuCajaRef"
        role="menu"
        aria-label="Opciones de Caja"
        class="absolute bottom-full right-2 z-[5] mb-2 flex gap-2 rounded-2xl border border-white/15 bg-[#12331f] p-2 shadow-[0_10px_30px_-8px_rgba(0,0,0,0.55)]"
        @click.stop
      >
        <button
          v-for="opcion in opcionesCaja"
          :key="opcion.clave"
          type="button"
          role="menuitem"
          class="flex min-h-[44px] min-w-[68px] touch-manipulation flex-col items-center justify-center gap-1 rounded-xl px-2 py-1.5 text-white transition-colors [-webkit-tap-highlight-color:transparent]"
          :class="opcion.esActual ? 'bg-white/20' : 'hover:bg-white/10 active:bg-white/15'"
          @click="irACaja(opcion.ruta)"
        >
          <component :is="opcion.icono" class="h-5 w-5 flex-shrink-0" />
          <span class="text-[10px] font-semibold leading-tight">{{ opcion.etiqueta }}</span>
        </button>
      </div>
    </Transition>

    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 translate-y-2 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 translate-y-2 scale-95"
    >
      <div
        v-if="menuAccionesAbierto && acciones.length > 0"
        role="menu"
        aria-label="Acciones de la natillera"
        class="absolute bottom-full right-2 z-[5] mb-2 flex max-w-[calc(100vw-1rem)] flex-wrap justify-end gap-1.5 rounded-2xl border border-white/15 bg-[#12331f] p-2 shadow-[0_10px_30px_-8px_rgba(0,0,0,0.55)]"
        @click.stop
      >
        <button
          v-for="accion in acciones"
          :key="accion.clave"
          type="button"
          role="menuitem"
          class="flex min-h-[44px] min-w-[60px] touch-manipulation flex-col items-center justify-center gap-1 rounded-xl px-1.5 py-1.5 transition-colors [-webkit-tap-highlight-color:transparent]"
          :class="[
            accion.esActual ? 'bg-white/20' : 'hover:bg-white/10 active:bg-white/15',
            accion.peligro ? 'text-rose-200' : 'text-white'
          ]"
          @click="elegirAccion(accion.clave)"
        >
          <component :is="accion.icono" class="h-5 w-5 flex-shrink-0" />
          <span class="text-[10px] font-semibold leading-tight">{{ accion.etiqueta }}</span>
        </button>
      </div>
    </Transition>

    <div class="flex items-end justify-around gap-0.5 px-1 max-w-screen-sm mx-auto relative z-[3]">
      <!-- Inicio / Detalle Natillera -->
      <router-link
        :to="`/natilleras/${natilleraId}`"
        class="nav-item flex flex-col items-center justify-center gap-0.5 min-w-0 flex-1 max-w-[52px] rounded-xl px-1.5 py-1.5 min-h-[44px] transition-all duration-200 relative touch-manipulation"
        :class="isActive(`/natilleras/${natilleraId}`) ? 'nav-item--active' : 'nav-item--inactive'"
      >
        <div
          v-if="isActive(`/natilleras/${natilleraId}`)"
          class="absolute -top-1.5 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rounded-full shadow-md"
          aria-hidden="true"
        />
        <HomeIconSolid
          v-if="isActive(`/natilleras/${natilleraId}`)"
          class="w-5 h-5 sm:w-6 sm:h-6 transition-all text-white flex-shrink-0"
        />
        <HomeIcon
          v-else
          class="w-5 h-5 sm:w-6 sm:h-6 transition-all flex-shrink-0"
        />
        <span
          class="text-[10px] sm:text-[11px] font-semibold transition-colors leading-tight"
          :class="isActive(`/natilleras/${natilleraId}`) ? 'text-white' : ''"
        >Inicio</span>
      </router-link>

      <!-- Socios -->
      <router-link
        v-if="natilleraId"
        id="tour-bottom-nav-socios"
        :to="`/natilleras/${natilleraId}/socios`"
        class="nav-item flex flex-col items-center justify-center gap-0.5 min-w-0 flex-1 max-w-[52px] rounded-xl px-1.5 py-1.5 min-h-[44px] transition-all duration-200 relative touch-manipulation"
        :class="isActive(`/natilleras/${natilleraId}/socios`) ? 'nav-item--active' : 'nav-item--inactive'"
      >
        <div
          v-if="isActive(`/natilleras/${natilleraId}/socios`)"
          class="absolute -top-1.5 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rounded-full shadow-md"
          aria-hidden="true"
        />
        <UsersIconSolid
          v-if="isActive(`/natilleras/${natilleraId}/socios`)"
          class="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 transition-all text-white"
        />
        <UsersIcon
          v-else
          class="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 transition-all"
        />
        <span
          class="text-[10px] sm:text-[11px] leading-tight font-semibold transition-colors"
          :class="isActive(`/natilleras/${natilleraId}/socios`) ? 'text-white' : ''"
        >Socios</span>
      </router-link>
      <button
        v-else
        type="button"
        @click="navegarAPrimeraNatillera('socios')"
        class="nav-item nav-item--inactive flex flex-col items-center justify-center gap-0.5 min-w-0 flex-1 max-w-[52px] rounded-xl px-1.5 py-1.5 min-h-[44px] transition-all duration-200 touch-manipulation"
      >
        <UsersIcon class="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
        <span class="text-[10px] sm:text-[11px] leading-tight font-semibold">Socios</span>
      </button>

      <!-- Cuotas -->
      <router-link
        v-if="natilleraId"
        id="tour-bottom-nav-cuotas"
        :to="`/natilleras/${natilleraId}/cuotas`"
        class="nav-item flex flex-col items-center justify-center gap-0.5 min-w-0 flex-1 max-w-[52px] rounded-xl px-1.5 py-1.5 min-h-[44px] transition-all duration-200 relative touch-manipulation"
        :class="isActive(`/natilleras/${natilleraId}/cuotas`) ? 'nav-item--active' : 'nav-item--inactive'"
      >
        <div
          v-if="isActive(`/natilleras/${natilleraId}/cuotas`)"
          class="absolute -top-1.5 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rounded-full shadow-md"
          aria-hidden="true"
        />
        <CurrencyDollarIconSolid
          v-if="isActive(`/natilleras/${natilleraId}/cuotas`)"
          class="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 transition-all text-white"
        />
        <CurrencyDollarIcon
          v-else
          class="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 transition-all"
        />
        <span
          class="text-[10px] sm:text-[11px] leading-tight font-semibold transition-colors"
          :class="isActive(`/natilleras/${natilleraId}/cuotas`) ? 'text-white' : ''"
        >Cuotas</span>
      </router-link>
      <button
        v-else
        type="button"
        @click="navegarAPrimeraNatillera('cuotas')"
        class="nav-item nav-item--inactive flex flex-col items-center justify-center gap-0.5 min-w-0 flex-1 max-w-[52px] rounded-xl px-1.5 py-1.5 min-h-[44px] transition-all duration-200 touch-manipulation"
      >
        <CurrencyDollarIcon class="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
        <span class="text-[10px] sm:text-[11px] leading-tight font-semibold">Cuotas</span>
      </button>

      <!-- Préstamos -->
      <button
        v-if="natilleraId"
        type="button"
        class="nav-item flex flex-col items-center justify-center gap-0.5 min-w-0 flex-1 max-w-[52px] rounded-xl px-1.5 py-1.5 min-h-[44px] transition-all duration-200 relative touch-manipulation [-webkit-tap-highlight-color:transparent]"
        :class="isActive(`/natilleras/${natilleraId}/prestamos`) ? 'nav-item--active' : 'nav-item--inactive'"
        @click="irAPrestamosDesdeNav"
      >
        <div
          v-if="isActive(`/natilleras/${natilleraId}/prestamos`)"
          class="absolute -top-1.5 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rounded-full shadow-md"
          aria-hidden="true"
        />
        <BanknotesIconSolid
          v-if="isActive(`/natilleras/${natilleraId}/prestamos`)"
          class="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 transition-all text-white"
        />
        <BanknotesIcon
          v-else
          class="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 transition-all"
        />
        <span
          class="text-[10px] sm:text-[11px] leading-tight font-semibold transition-colors"
          :class="isActive(`/natilleras/${natilleraId}/prestamos`) ? 'text-white' : ''"
        >Prést.</span>
      </button>
      <button
        v-else
        type="button"
        @click="navegarAPrimeraNatillera('prestamos')"
        class="nav-item nav-item--inactive flex flex-col items-center justify-center gap-0.5 min-w-0 flex-1 max-w-[52px] rounded-xl px-1.5 py-1.5 min-h-[44px] transition-all duration-200 touch-manipulation"
      >
        <BanknotesIcon class="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
        <span class="text-[10px] sm:text-[11px] leading-tight font-semibold">Prést.</span>
      </button>

      <!-- Actividades -->
      <router-link
        v-if="natilleraId"
        :to="`/natilleras/${natilleraId}/actividades`"
        class="nav-item flex flex-col items-center justify-center gap-0.5 min-w-0 flex-1 max-w-[52px] rounded-xl px-1.5 py-1.5 min-h-[44px] transition-all duration-200 relative touch-manipulation"
        :class="isActive(`/natilleras/${natilleraId}/actividades`) ? 'nav-item--active' : 'nav-item--inactive'"
      >
        <div
          v-if="isActive(`/natilleras/${natilleraId}/actividades`)"
          class="absolute -top-1.5 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rounded-full shadow-md"
          aria-hidden="true"
        />
        <CalendarIconSolid
          v-if="isActive(`/natilleras/${natilleraId}/actividades`)"
          class="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 transition-all text-white"
        />
        <CalendarIcon
          v-else
          class="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 transition-all"
        />
        <span
          class="text-[10px] sm:text-[11px] leading-tight font-semibold transition-colors"
          :class="isActive(`/natilleras/${natilleraId}/actividades`) ? 'text-white' : ''"
        >Act.</span>
      </router-link>
      <button
        v-else
        type="button"
        @click="navegarAPrimeraNatillera('actividades')"
        class="nav-item nav-item--inactive flex flex-col items-center justify-center gap-0.5 min-w-0 flex-1 max-w-[52px] rounded-xl px-1.5 py-1.5 min-h-[44px] transition-all duration-200 touch-manipulation"
      >
        <CalendarIcon class="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
        <span class="text-[10px] sm:text-[11px] leading-tight font-semibold">Act.</span>
      </button>

      <!--
        Caja: un solo espacio que agrupa Conciliación y Movimientos.
        Con siete opciones la barra ya iba al límite de ancho en un iPhone SE, así que
        meter dos más de a una las habría dejado ilegibles. Este espacio abre una hoja
        donde cada destino tiene sitio para explicar a qué pregunta responde, y se pinta
        como activo cuando estás en cualquiera de los dos.
      -->
      <button
        v-if="natilleraId"
        id="tour-bottom-nav-caja"
        type="button"
        class="nav-item flex flex-col items-center justify-center gap-0.5 min-w-0 flex-1 max-w-[52px] rounded-xl px-1.5 py-1.5 min-h-[44px] transition-all duration-200 relative touch-manipulation [-webkit-tap-highlight-color:transparent]"
        :class="cajaActiva ? 'nav-item--active' : 'nav-item--inactive'"
        aria-haspopup="menu"
        :aria-expanded="menuCajaAbierto"
        @click.stop="alternarMenu('caja')"
      >
        <div
          v-if="cajaActiva"
          class="absolute -top-1.5 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rounded-full shadow-md"
          aria-hidden="true"
        />
        <WalletIconSolid
          v-if="cajaActiva"
          class="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 transition-all text-white"
        />
        <WalletIcon
          v-else
          class="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 transition-all"
        />
        <span
          class="text-[10px] sm:text-[11px] leading-tight font-semibold transition-colors"
          :class="cajaActiva ? 'text-white' : ''"
        >Caja</span>
      </button>
      <button
        v-else
        type="button"
        @click="navegarAPrimeraNatillera('conciliacion')"
        class="nav-item nav-item--inactive flex flex-col items-center justify-center gap-0.5 min-w-0 flex-1 max-w-[52px] rounded-xl px-1.5 py-1.5 min-h-[44px] transition-all duration-200 touch-manipulation"
      >
        <WalletIcon class="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
        <span class="text-[10px] sm:text-[11px] leading-tight font-semibold">Caja</span>
      </button>

      <!--
        Acciones: herramientas de la natillera (buscar comprobante, invitar, notificar,
        configurar, cerrar), con el mismo menú flotante de «Caja». Sustituye al botón
        de Configuración, que ahora es una de las acciones.
      -->
      <button
        v-if="natilleraId"
        id="tour-bottom-nav-acciones"
        type="button"
        class="nav-item flex flex-col items-center justify-center gap-0.5 min-w-0 flex-1 max-w-[52px] rounded-xl px-1.5 py-1.5 min-h-[44px] transition-all duration-200 relative touch-manipulation [-webkit-tap-highlight-color:transparent]"
        :class="accionesActiva ? 'nav-item--active' : 'nav-item--inactive'"
        aria-haspopup="menu"
        :aria-expanded="menuAccionesAbierto"
        @click.stop="alternarMenu('acciones')"
      >
        <div
          v-if="accionesActiva"
          class="absolute -top-1.5 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rounded-full shadow-md"
          aria-hidden="true"
        />
        <WrenchScrewdriverIconSolid
          v-if="accionesActiva"
          class="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 transition-all text-white"
        />
        <WrenchScrewdriverIcon
          v-else
          class="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 transition-all"
        />
        <span
          class="text-[10px] sm:text-[11px] leading-tight font-semibold transition-colors"
          :class="accionesActiva ? 'text-white' : ''"
        >Acciones</span>
      </button>
      <router-link
        v-else
        to="/configuracion"
        class="nav-item flex flex-col items-center justify-center gap-0.5 min-w-0 flex-1 max-w-[52px] rounded-xl px-1.5 py-1.5 min-h-[44px] transition-all duration-200 relative touch-manipulation"
        :class="isActive('/configuracion') ? 'nav-item--active' : 'nav-item--inactive'"
      >
        <div
          v-if="isActive('/configuracion')"
          class="absolute -top-1.5 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rounded-full shadow-md"
          aria-hidden="true"
        />
        <Cog6ToothIconSolid
          v-if="isActive('/configuracion')"
          class="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 transition-all text-white"
        />
        <Cog6ToothIcon
          v-else
          class="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 transition-all"
        />
        <span
          class="text-[10px] sm:text-[11px] leading-tight font-semibold transition-colors"
          :class="isActive('/configuracion') ? 'text-white' : ''"
        >Ajustes</span>
      </router-link>
    </div>
  </nav>

</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useNatillerasStore } from '../stores/natilleras'
import { useNotificationStore } from '../stores/notifications'
import { natilleraPrestamosDeshabilitados } from '../utils/natilleraPrestamos'
import { useTapadoInferior } from '../composables/useTapadoInferior'

const props = defineProps({
  /** Oculta la barra cuando el menú lateral está abierto (móvil) */
  forceHidden: { type: Boolean, default: false },
  /**
   * Acciones de la natillera que el usuario puede usar, ya filtradas por permisos
   * (las arma DashboardLayout): [{ clave, etiqueta, icono, esActual, peligro? }].
   */
  acciones: { type: Array, default: () => [] }
})

const emit = defineEmits(['accion'])

// En Safari de iOS la barra de direcciones vive abajo y se pinta encima del
// contenido, tapando esta barra. `tapadoInferior` es lo que hay que levantarla
// para que quede justo por encima; vale 0 en Android y en la PWA instalada.
const { tapado: tapadoInferior } = useTapadoInferior()

// Prefetch de los chunks de las vistas destino del nav inferior para que al tocar
// el ícono la navegación sea instantánea en lugar de esperar la descarga del chunk.
const _navViewImports = [
  () => import('../views/natilleras/NatilleraDetalle.vue'),
  () => import('../views/socios/Socios.vue'),
  () => import('../views/cuotas/Cuotas.vue'),
  () => import('../views/prestamos/Prestamos.vue'),
  () => import('../views/actividades/Actividades.vue'),
  () => import('../views/pagos/PagosSocios.vue'),
  () => import('../views/conciliacion/ConciliacionCaja.vue'),
  () => import('../views/movimientos/Movimientos.vue'),
  () => import('../views/natilleras/NatilleraConfiguracion.vue'),
]

onMounted(() => {
  const prefetchAll = () => {
    _navViewImports.forEach((load, i) => {
      setTimeout(() => load().catch(() => {}), i * 120)
    })
  }
  if ('requestIdleCallback' in window) {
    requestIdleCallback(prefetchAll, { timeout: 3000 })
  } else {
    setTimeout(prefetchAll, 1500)
  }
})

// Animación de atención: cada 5s de inactividad, la barra inferior da un pequeño
// rebote + brillo para recordarle al usuario que está ahí. Se reinicia con cualquier
// interacción (toque, scroll, tecla) y se pausa cuando la pestaña está oculta.
const destacarBarra = ref(false)
const IDLE_MS = 5000
const ANIMATION_MS = 1400
let idleTimerId = null
let animationResetId = null

function programarDestacar() {
  if (idleTimerId) clearTimeout(idleTimerId)
  idleTimerId = window.setTimeout(() => {
    if (document.hidden) return
    destacarBarra.value = true
    if (animationResetId) clearTimeout(animationResetId)
    animationResetId = window.setTimeout(() => {
      destacarBarra.value = false
      animationResetId = null
      programarDestacar()
    }, ANIMATION_MS)
  }, IDLE_MS)
}

function reiniciarInactividad() {
  if (destacarBarra.value) {
    destacarBarra.value = false
    if (animationResetId) {
      clearTimeout(animationResetId)
      animationResetId = null
    }
  }
  programarDestacar()
}

function manejarVisibilidad() {
  if (document.hidden) {
    if (idleTimerId) {
      clearTimeout(idleTimerId)
      idleTimerId = null
    }
    if (animationResetId) {
      clearTimeout(animationResetId)
      animationResetId = null
    }
    destacarBarra.value = false
  } else {
    programarDestacar()
  }
}

onMounted(() => {
  programarDestacar()
  window.addEventListener('pointerdown', reiniciarInactividad, { passive: true })
  window.addEventListener('touchstart', reiniciarInactividad, { passive: true })
  window.addEventListener('keydown', reiniciarInactividad)
  window.addEventListener('scroll', reiniciarInactividad, { passive: true, capture: true })
  document.addEventListener('visibilitychange', manejarVisibilidad)
})

onUnmounted(() => {
  if (idleTimerId) clearTimeout(idleTimerId)
  if (animationResetId) clearTimeout(animationResetId)
  window.removeEventListener('pointerdown', reiniciarInactividad)
  window.removeEventListener('touchstart', reiniciarInactividad)
  window.removeEventListener('keydown', reiniciarInactividad)
  window.removeEventListener('scroll', reiniciarInactividad, { capture: true })
  document.removeEventListener('visibilitychange', manejarVisibilidad)
})
import {
  HomeIcon,
  UsersIcon,
  CurrencyDollarIcon,
  BanknotesIcon,
  CalendarIcon,
  WalletIcon,
  Cog6ToothIcon,
  ReceiptPercentIcon,
  ScaleIcon,
  ArrowsRightLeftIcon,
  WrenchScrewdriverIcon
} from '@heroicons/vue/24/outline'
import {
  HomeIcon as HomeIconSolid,
  UsersIcon as UsersIconSolid,
  CurrencyDollarIcon as CurrencyDollarIconSolid,
  BanknotesIcon as BanknotesIconSolid,
  CalendarIcon as CalendarIconSolid,
  WalletIcon as WalletIconSolid,
  Cog6ToothIcon as Cog6ToothIconSolid,
  WrenchScrewdriverIcon as WrenchScrewdriverIconSolid
} from '@heroicons/vue/24/solid'

const route = useRoute()
const router = useRouter()
const natillerasStore = useNatillerasStore()
const notificationStore = useNotificationStore()

function natilleraEnRutaParaPrestamos() {
  const id = natilleraId.value
  if (!id) return null
  const list = natillerasStore.todasLasNatilleras || []
  let n = list.find((x) => String(x.id) === String(id))
  if (!n) {
    const na = natillerasStore.natilleraActual
    if (na && String(na.id) === String(id)) n = na
  }
  return n || null
}

function irAPrestamosDesdeNav() {
  const id = natilleraId.value
  if (!id) return
  const n = natilleraEnRutaParaPrestamos()
  if (n && natilleraPrestamosDeshabilitados(n)) {
    notificationStore.info('La natillera no permite préstamos', 'Préstamos')
    return
  }
  router.push(`/natilleras/${id}/prestamos`)
}

// Extraer el ID de natillera de la ruta actual
const natilleraId = computed(() => {
  const id = route.params.id
  // Validar que el ID sea válido (no undefined, null, o string "undefined")
  if (!id || id === 'undefined' || id === 'null') {
    return null
  }
  return id
})

// Verificar si una ruta está activa
function isActive(path) {
  if (path === '/configuracion') {
    return route.path === '/configuracion'
  }
  // Para la vista de detalle de natillera, verificar que sea exactamente esa ruta (sin subrutas)
  if (path === `/natilleras/${natilleraId.value}`) {
    // Está activo solo si es exactamente la ruta de detalle (no subrutas como /socios, /cuotas, etc.)
    return route.path === path
  }
  // Para rutas de natilleras (socios, cuotas, etc.), verificar si la ruta comienza con el path
  return route.path.startsWith(path)
}

/* --------------------------------- Espacio «Caja» ---------------------------- */

const menuCajaAbierto = ref(false)
const menuCajaRef = ref(null)

/* Los destinos que agrupa «Caja». Etiquetas de una palabra: van bajo un icono. */
const opcionesCaja = computed(() => {
  const base = `/natilleras/${natilleraId.value}`
  return [
    {
      clave: 'pagos',
      etiqueta: 'Pagos',
      icono: ReceiptPercentIcon,
      ruta: `${base}/pagos`,
      esActual: route.path.startsWith(`${base}/pagos`)
    },
    {
      clave: 'conciliacion',
      etiqueta: 'Conciliar',
      icono: ScaleIcon,
      ruta: `${base}/conciliacion`,
      esActual: route.path.startsWith(`${base}/conciliacion`)
    },
    {
      clave: 'movimientos',
      etiqueta: 'Movim.',
      icono: ArrowsRightLeftIcon,
      ruta: `${base}/movimientos`,
      esActual: route.path.startsWith(`${base}/movimientos`)
    }
  ]
})

function irACaja(ruta) {
  menuCajaAbierto.value = false
  if (route.path === ruta) return
  router.push(ruta)
}

/* ------------------------------- Espacio «Acciones» ------------------------------ */

const menuAccionesAbierto = ref(false)

// Un solo menú flotante a la vez: abrir uno cierra el otro.
function alternarMenu(cual) {
  const abrirCaja = cual === 'caja' && !menuCajaAbierto.value
  const abrirAcciones = cual === 'acciones' && !menuAccionesAbierto.value
  menuCajaAbierto.value = abrirCaja
  menuAccionesAbierto.value = abrirAcciones
}

function elegirAccion(clave) {
  menuAccionesAbierto.value = false
  emit('accion', clave)
}

// Activo estando en cualquiera de las pantallas a las que lleva (configurar, notificar…).
const accionesActiva = computed(() => props.acciones.some(a => a.esActual))

/* Tocar fuera los cierra, como cualquier desplegable. Los botones de la barra paran el
   evento con `@click.stop`, así que su propio toque no llega aquí y no cierra y reabre. */
function cerrarMenusFuera() {
  menuCajaAbierto.value = false
  menuAccionesAbierto.value = false
}

watch([menuCajaAbierto, menuAccionesAbierto], ([caja, acciones]) => {
  if (caja || acciones) document.addEventListener('click', cerrarMenusFuera)
  else document.removeEventListener('click', cerrarMenusFuera)
})

onUnmounted(() => document.removeEventListener('click', cerrarMenusFuera))

// El espacio se pinta activo estando en cualquiera de las dos pantallas que agrupa,
// para que la barra no diga «no estás en ningún sitio» cuando sí lo estás.
const cajaActiva = computed(() => {
  if (!natilleraId.value) return false
  const base = `/natilleras/${natilleraId.value}`
  return route.path.startsWith(`${base}/pagos`) ||
    route.path.startsWith(`${base}/conciliacion`) ||
    route.path.startsWith(`${base}/movimientos`)
})

// Con el botón «atrás» del teléfono la hoja debe cerrarse como cualquier otra capa.
watch(() => route.fullPath, () => {
  menuCajaAbierto.value = false
  menuAccionesAbierto.value = false
})

// Navegar a la primera natillera activa con la sección especificada
function navegarAPrimeraNatillera(seccion) {
  const todasLasNatilleras = natillerasStore.todasLasNatilleras || []
  if (seccion === 'prestamos') {
    const candidata = todasLasNatilleras.find(
      (n) => n.estado === 'activa' && !natilleraPrestamosDeshabilitados(n)
    )
    if (candidata?.id) {
      const id = String(candidata.id)
      if (id && id !== 'undefined' && id !== 'null') {
        router.push(`/natilleras/${id}/prestamos`)
        return
      }
    }
    notificationStore.info(
      'No hay una natillera activa con préstamos habilitados',
      'Préstamos'
    )
    router.push('/dashboard')
    return
  }

  const natilleraActiva = todasLasNatilleras.find((n) => n.estado === 'activa')

  if (natilleraActiva && natilleraActiva.id) {
    const id = String(natilleraActiva.id)
    if (id && id !== 'undefined' && id !== 'null') {
      router.push(`/natilleras/${id}/${seccion}`)
    } else {
      router.push('/dashboard')
    }
  } else {
    router.push('/dashboard')
  }
}
</script>

<style scoped>
/* Ítem activo = mismo verde que el botón principal del login (token --primary) */
.mobile-bottom-nav {
  isolation: isolate;
  /* `--tapado-inferior` lo fija useTapadoInferior: en Safari de iOS es el alto de
     la barra de direcciones, que se dibuja encima de esta barra. Sumarlo al
     padding sube los iconos por encima de ella sin despegar la barra del fondo,
     que es lo que pasaría moviendo `bottom` (dejaría un hueco a la vista).
     Vale 0 en Android y en la PWA instalada, donde no hay chrome que esquivar. */
  padding-bottom: calc(max(0.3rem, env(safe-area-inset-bottom, 0px)) + var(--tapado-inferior, 0px));
}

.mobile-bottom-nav .nav-item--inactive {
  color: hsl(152 42% 78% / 0.92);
}

.mobile-bottom-nav .nav-item--inactive:hover {
  color: #fff;
}

.nav-item--active {
  background-color: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  padding-top: 0.3rem;
  padding-bottom: 0.25rem;
  margin-top: -0.55rem;
  box-shadow:
    0 2px 12px hsl(var(--primary) / 0.28),
    0 4px 14px rgba(0, 0, 0, 0.12);
}

.nav-item--active:hover {
  color: white;
}

.nav-item--inactive {
  background-color: transparent;
}

.router-link-active {
  color: white;
}

.router-link-active svg {
  color: white;
}

/* Animación de atención cada 20s de inactividad.
   Usa translate3d para forzar aceleración por GPU en iOS Safari/Android WebView
   y evitar jank. Respeta prefers-reduced-motion. */
@keyframes bottom-nav-rebote {
  0%   { transform: translate3d(0, 0, 0); }
  15%  { transform: translate3d(0, -10px, 0); }
  32%  { transform: translate3d(0, 0, 0); }
  50%  { transform: translate3d(0, -5px, 0); }
  68%  { transform: translate3d(0, 0, 0); }
  84%  { transform: translate3d(0, -2px, 0); }
  100% { transform: translate3d(0, 0, 0); }
}

@keyframes bottom-nav-brillo {
  0% {
    box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.25);
  }
  40% {
    box-shadow:
      0 -4px 24px rgba(0, 0, 0, 0.25),
      0 -2px 30px hsl(var(--primary) / 0.55),
      0 -8px 20px hsl(var(--primary) / 0.35);
  }
  100% {
    box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.25);
  }
}

.mobile-bottom-nav--destacar {
  animation:
    bottom-nav-rebote 1.2s cubic-bezier(0.34, 1.56, 0.64, 1),
    bottom-nav-brillo 1.2s ease-in-out;
  -webkit-animation:
    bottom-nav-rebote 1.2s cubic-bezier(0.34, 1.56, 0.64, 1),
    bottom-nav-brillo 1.2s ease-in-out;
  /* Mantener la transición base del forceHidden; animation se superpone temporalmente */
  will-change: transform, box-shadow;
}

/* Haz de brillo que atraviesa las opciones (shine sweep) */
@keyframes bottom-nav-shine-sweep {
  0%   { transform: translate3d(-120%, 0, 0) skewX(-18deg); opacity: 0; }
  15%  { opacity: 1; }
  85%  { opacity: 1; }
  100% { transform: translate3d(120%, 0, 0) skewX(-18deg); opacity: 0; }
}

.mobile-bottom-nav__shine {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 45%;
  background: linear-gradient(
    100deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.12) 35%,
    rgba(255, 255, 255, 0.55) 50%,
    rgba(255, 255, 255, 0.12) 65%,
    rgba(255, 255, 255, 0) 100%
  );
  transform: translate3d(-120%, 0, 0) skewX(-18deg);
  animation: bottom-nav-shine-sweep 1.1s ease-out;
  -webkit-animation: bottom-nav-shine-sweep 1.1s ease-out;
  will-change: transform, opacity;
  mix-blend-mode: screen;
}

@media (prefers-reduced-motion: reduce) {
  .mobile-bottom-nav--destacar {
    animation: bottom-nav-brillo 1.2s ease-in-out;
    -webkit-animation: bottom-nav-brillo 1.2s ease-in-out;
  }
  .mobile-bottom-nav__shine {
    animation: none;
    -webkit-animation: none;
    opacity: 0;
  }
}
</style>

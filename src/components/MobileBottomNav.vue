<template>
  <nav
    v-if="natilleraId"
    id="tour-mobile-bottom-nav"
    class="mobile-bottom-nav mobile-bottom-nav--shell lg:hidden fixed bottom-0 left-0 right-0 z-[49] app-shell-nav-bg rounded-t-3xl pt-3 overflow-visible shadow-[0_-4px_24px_rgba(0,0,0,0.25)] transition-transform duration-300 ease-out"
    :class="[
      forceHidden ? 'translate-y-[110%] pointer-events-none opacity-0' : 'translate-y-0 opacity-100',
      destacarBarra && !forceHidden ? 'mobile-bottom-nav--destacar' : ''
    ]"
  >
    <!-- Haz de brillo que barre a través de las opciones durante la animación de atención -->
    <div
      v-if="destacarBarra && !forceHidden"
      class="pointer-events-none absolute inset-x-0 top-0 bottom-0 rounded-t-3xl overflow-hidden z-[2]"
      aria-hidden="true"
    >
      <div class="mobile-bottom-nav__shine"></div>
    </div>
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

      <!-- Totales generales -->
      <router-link
        v-if="natilleraId"
        id="tour-bottom-nav-totales"
        :to="`/natilleras/${natilleraId}/cuadre-caja`"
        class="nav-item flex flex-col items-center justify-center gap-0.5 min-w-0 flex-1 max-w-[52px] rounded-xl px-1.5 py-1.5 min-h-[44px] transition-all duration-200 relative touch-manipulation"
        :class="isActive(`/natilleras/${natilleraId}/cuadre-caja`) ? 'nav-item--active' : 'nav-item--inactive'"
      >
        <div
          v-if="isActive(`/natilleras/${natilleraId}/cuadre-caja`)"
          class="absolute -top-1.5 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rounded-full shadow-md"
          aria-hidden="true"
        />
        <CalculatorIconSolid
          v-if="isActive(`/natilleras/${natilleraId}/cuadre-caja`)"
          class="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 transition-all text-white"
        />
        <CalculatorIcon
          v-else
          class="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 transition-all"
        />
        <span
          class="text-[10px] sm:text-[11px] leading-tight font-semibold transition-colors"
          :class="isActive(`/natilleras/${natilleraId}/cuadre-caja`) ? 'text-white' : ''"
        >Totales</span>
      </router-link>
      <button
        v-else
        type="button"
        @click="navegarAPrimeraNatillera('cuadre-caja')"
        class="nav-item nav-item--inactive flex flex-col items-center justify-center gap-0.5 min-w-0 flex-1 max-w-[52px] rounded-xl px-1.5 py-1.5 min-h-[44px] transition-all duration-200 touch-manipulation"
      >
        <CalculatorIcon class="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
        <span class="text-[10px] sm:text-[11px] leading-tight font-semibold">Totales</span>
      </button>

      <!-- Configuración -->
      <router-link
        v-if="natilleraId"
        :to="`/natilleras/${natilleraId}/configuracion`"
        class="nav-item flex flex-col items-center justify-center gap-0.5 min-w-0 flex-1 max-w-[52px] rounded-xl px-1.5 py-1.5 min-h-[44px] transition-all duration-200 relative touch-manipulation"
        :class="isActive(`/natilleras/${natilleraId}/configuracion`) ? 'nav-item--active' : 'nav-item--inactive'"
      >
        <div
          v-if="isActive(`/natilleras/${natilleraId}/configuracion`)"
          class="absolute -top-1.5 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rounded-full shadow-md"
          aria-hidden="true"
        />
        <Cog6ToothIconSolid
          v-if="isActive(`/natilleras/${natilleraId}/configuracion`)"
          class="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 transition-all text-white"
        />
        <Cog6ToothIcon
          v-else
          class="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 transition-all"
        />
        <span
          class="text-[10px] sm:text-[11px] leading-tight font-semibold transition-colors"
          :class="isActive(`/natilleras/${natilleraId}/configuracion`) ? 'text-white' : ''"
        >Config</span>
      </router-link>
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
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useNatillerasStore } from '../stores/natilleras'
import { useNotificationStore } from '../stores/notifications'
import { natilleraPrestamosDeshabilitados } from '../utils/natilleraPrestamos'

defineProps({
  /** Oculta la barra cuando el menú lateral está abierto (móvil) */
  forceHidden: { type: Boolean, default: false }
})

// Prefetch de los chunks de las vistas destino del nav inferior para que al tocar
// el ícono la navegación sea instantánea en lugar de esperar la descarga del chunk.
const _navViewImports = [
  () => import('../views/natilleras/NatilleraDetalle.vue'),
  () => import('../views/socios/Socios.vue'),
  () => import('../views/cuotas/Cuotas.vue'),
  () => import('../views/prestamos/Prestamos.vue'),
  () => import('../views/actividades/Actividades.vue'),
  () => import('../views/cuadre/CuadreCaja.vue'),
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
  CalculatorIcon,
  Cog6ToothIcon
} from '@heroicons/vue/24/outline'
import {
  HomeIcon as HomeIconSolid,
  UsersIcon as UsersIconSolid,
  CurrencyDollarIcon as CurrencyDollarIconSolid,
  BanknotesIcon as BanknotesIconSolid,
  CalendarIcon as CalendarIconSolid,
  CalculatorIcon as CalculatorIconSolid,
  Cog6ToothIcon as Cog6ToothIconSolid
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
  padding-bottom: max(0.3rem, env(safe-area-inset-bottom, 0px));
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

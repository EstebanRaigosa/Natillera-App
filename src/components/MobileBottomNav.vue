<template>
  <nav
    v-if="natilleraId"
    id="tour-mobile-bottom-nav"
    class="mobile-bottom-nav mobile-bottom-nav--shell lg:hidden fixed bottom-0 left-0 right-0 z-[49] app-shell-nav-bg rounded-t-3xl pt-3 overflow-visible shadow-[0_-4px_24px_rgba(0,0,0,0.25)] transition-transform duration-300 ease-out"
    :class="forceHidden ? 'translate-y-[110%] pointer-events-none opacity-0' : 'translate-y-0 opacity-100'"
  >
    <div class="flex items-end justify-around gap-0.5 px-1 max-w-screen-sm mx-auto">
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
import { computed, onMounted } from 'vue'
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
  () => import('../views/cuotas/CuotasMeses.vue'),
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
</style>

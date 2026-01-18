<template>
  <div class="min-h-screen flex">
    <!-- Sidebar -->
    <aside 
      :class="[
        'fixed inset-y-0 left-0 z-50 w-72 bg-gradient-to-br from-natillera-700 via-emerald-700 to-teal-700 backdrop-blur-xl border-r border-emerald-600/30 transform transition-transform duration-300 lg:translate-x-0 lg:static',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      ]"
    >
      <div class="flex flex-col h-full">
        <!-- Logo -->
        <div class="p-6 border-b border-emerald-600/30">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg shadow-black/20 border border-white/20">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h1 class="font-display font-bold text-xl">
                <AppBrand class="text-white" />
              </h1>
              <p class="text-xs text-emerald-100">Gestión comunitaria</p>
            </div>
          </div>
        </div>

        <!-- Navegación -->
        <nav class="flex-1 p-4 space-y-1 overflow-y-auto pb-24">
          <router-link 
            to="/dashboard" 
            class="nav-link"
            :class="{ 'nav-link-active': $route.path === '/dashboard' }"
            @click="cerrarSidebar"
          >
            <HomeIcon class="w-5 h-5" />
            <span>Mis Natilleras</span>
          </router-link>

          <router-link 
            to="/auditoria" 
            class="nav-link"
            :class="{ 'nav-link-active': $route.path === '/auditoria' }"
            @click="cerrarSidebar"
          >
            <ClipboardDocumentListIcon class="w-5 h-5" />
            <span>Auditoría</span>
          </router-link>

          <router-link 
            v-if="isAdmin"
            to="/admin/chat" 
            class="nav-link relative"
            :class="{ 'nav-link-active': $route.path === '/admin/chat' }"
            @click="cerrarSidebar; supportStore.resetUnreadCount()"
          >
            <ChatBubbleLeftRightIcon class="w-5 h-5" />
            <span>Soporte</span>
            <!-- Badge de notificación -->
            <Transition
              enter-active-class="transition duration-300 ease-out"
              enter-from-class="opacity-0 scale-0"
              enter-to-class="opacity-100 scale-100"
              leave-active-class="transition duration-200 ease-in"
              leave-from-class="opacity-100 scale-100"
              leave-to-class="opacity-0 scale-0"
              mode="out-in"
            >
              <span
                v-if="supportStore.hasUnreadMessages && $route.path !== '/admin/chat'"
                :key="`badge-${supportStore.unreadCount}`"
                class="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 bg-gradient-to-r from-red-500 to-rose-600 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg border-2 border-white animate-pulse"
              >
                {{ supportStore.unreadCount > 99 ? '99+' : supportStore.unreadCount }}
              </span>
            </Transition>
          </router-link>

          <router-link 
            v-if="isAdmin"
            to="/admin/data" 
            class="nav-link"
            :class="{ 'nav-link-active': $route.path === '/admin/data' }"
            @click="cerrarSidebar"
          >
            <ClipboardDocumentListIcon class="w-5 h-5" />
            <span>Datos BD</span>
          </router-link>

          <div class="pt-4 pb-2">
            <p class="px-4 text-xs font-semibold text-emerald-100/90 uppercase tracking-wider mb-3">Accesos Rápidos</p>
            <div class="mx-4 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
          </div>

          <!-- Natilleras Activas -->
          <div v-if="natillerasStore.loading" class="px-4 py-2">
            <p class="text-xs text-gray-400">Cargando...</p>
          </div>
          <template v-else-if="todasLasNatillerasActivas.length > 0">
            <div 
              v-for="natillera in todasLasNatillerasActivas" 
              :key="natillera.id"
              class="space-y-1"
            >
              <!-- Contenedor principal de la natillera -->
              <div 
                class="flex items-center gap-2 pr-1 rounded-xl px-1 py-1 transition-all duration-200 relative"
                :class="{
                  'border-2 border-sky-500/85 shadow-lg shadow-sky-600/35 bg-gradient-to-r from-sky-500/6 via-transparent to-sky-500/6': !natillera.es_propia
                }"
              >
                <!-- Indicador decorativo para natilleras compartidas -->
                <div 
                  v-if="!natillera.es_propia"
                  class="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-sky-400 via-sky-500 to-sky-400 rounded-full shadow-md shadow-sky-500/50"
                ></div>
                
                <!-- Link a la vista de detalle con tooltip -->
                <div 
                  class="flex-1 min-w-0 relative group"
                >
                  <button
                    @click="navegarANatillera(natillera.id)"
                    @touchstart.stop="mostrarTooltip(natillera.id, $event)"
                    class="nav-link w-full min-w-0 text-left"
                    :class="{
                      'nav-link-active': $route.params.id === String(natillera.id) && $route.path.startsWith(`/natilleras/${natillera.id}`)
                    }"
                  >
                    <BanknotesIcon class="w-5 h-5 flex-shrink-0" />
                    <span class="truncate flex-1 text-left">{{ natillera.nombre }}</span>
                    <UserGroupIcon 
                      v-if="!natillera.es_propia" 
                      class="w-4 h-4 flex-shrink-0 ml-1.5 text-sky-400 drop-shadow-sm" 
                      title="Natillera compartida"
                    />
                  </button>
                  <!-- Tooltip elegante y estilizado -->
                  <div 
                    class="absolute left-1/2 -translate-x-1/2 bottom-full mb-2.5 px-5 py-2.5 bg-gradient-to-br from-slate-900/98 via-slate-800/98 to-slate-900/98 text-white text-xs font-semibold tracking-wide rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] transition-all duration-300 ease-out whitespace-nowrap z-50 pointer-events-none transform backdrop-blur-lg border border-emerald-500/25"
                    :class="{
                      'opacity-0 invisible translate-y-1 scale-[0.98]': tooltipVisible !== natillera.id,
                      'opacity-100 visible translate-y-0 scale-100': tooltipVisible === natillera.id,
                      'lg:opacity-0 lg:invisible lg:translate-y-1 lg:scale-[0.98] lg:group-hover:opacity-100 lg:group-hover:visible lg:group-hover:translate-y-0 lg:group-hover:scale-100': true
                    }"
                  >
                    <!-- Efecto de brillo superior elegante -->
                    <div class="absolute inset-0 rounded-xl bg-gradient-to-b from-white/12 via-white/4 to-transparent pointer-events-none"></div>
                    <!-- Contenido del tooltip -->
                    <div class="relative z-10">
                      <span class="text-emerald-50/95 drop-shadow-sm font-medium">{{ natillera.nombre }}</span>
                    </div>
                    <!-- Flecha elegante y precisa -->
                    <div class="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
                      <div class="w-2.5 h-2.5 bg-gradient-to-br from-slate-800/98 to-slate-900/98 rotate-45 border-r border-b border-emerald-500/25 shadow-[0_2px_8px_rgba(0,0,0,0.3)]"></div>
                    </div>
                  </div>
                </div>
                
                <!-- Botón para abrir/cerrar desplegable -->
                <button
                  @click.stop="toggleNatillera(natillera.id)"
                  :class="[
                    'p-2.5 rounded-xl transition-all duration-300 flex-shrink-0 shadow-lg border-2 relative z-10',
                    natilleraExpandida === natillera.id
                      ? 'bg-white/30 text-white hover:bg-white/40 border-white/40 shadow-black/30 backdrop-blur-sm'
                      : 'bg-white/20 text-emerald-100 hover:bg-white/30 hover:text-white border-white/20 hover:border-white/40 hover:shadow-lg backdrop-blur-sm'
                  ]"
                  title="Ver opciones"
                >
                  <ChevronDownIcon 
                    :class="['w-5 h-5 transition-transform duration-300', natilleraExpandida === natillera.id ? 'rotate-180' : '']" 
                  />
                </button>
              </div>
              
              <!-- Opciones desplegables -->
              <Transition
                enter-active-class="transition duration-300 ease-out"
                enter-from-class="opacity-0 -translate-y-4 max-h-0"
                enter-to-class="opacity-100 translate-y-0 max-h-96"
                leave-active-class="transition duration-200 ease-in"
                leave-from-class="opacity-100 translate-y-0 max-h-96"
                leave-to-class="opacity-0 -translate-y-4 max-h-0"
              >
                <div 
                  v-if="natilleraExpandida === natillera.id" 
                  class="ml-2 mr-2 mt-2 mb-2 p-3 rounded-xl border-2 shadow-lg space-y-1.5 overflow-hidden bg-white/25 backdrop-blur-sm border-white/40"
                >
                  <div class="text-xs font-semibold uppercase tracking-wider mb-2 px-2 text-white">
                    Opciones
                  </div>
                  <router-link
                    :to="`/natilleras/${natillera.id}/socios`"
                    class="nav-link-sub"
                    :class="{ 'nav-link-sub-active': $route.path === `/natilleras/${natillera.id}/socios` }"
                    @click="cerrarDesplegable"
                  >
                    <UsersIcon class="w-5 h-5" />
                    <span>Socios</span>
                  </router-link>
                  <router-link
                    :to="`/natilleras/${natillera.id}/cuotas`"
                    class="nav-link-sub"
                    :class="{ 'nav-link-sub-active': $route.path === `/natilleras/${natillera.id}/cuotas` }"
                    @click="cerrarDesplegable"
                  >
                    <CurrencyDollarIcon class="w-5 h-5" />
                    <span>Cuotas</span>
                  </router-link>
                  <router-link
                    :to="`/natilleras/${natillera.id}/prestamos`"
                    class="nav-link-sub"
                    :class="{ 'nav-link-sub-active': $route.path === `/natilleras/${natillera.id}/prestamos` }"
                    @click="cerrarDesplegable"
                  >
                    <BanknotesIcon class="w-5 h-5" />
                    <span>Préstamos</span>
                  </router-link>
                  <router-link
                    :to="`/natilleras/${natillera.id}/actividades`"
                    class="nav-link-sub"
                    :class="{ 'nav-link-sub-active': $route.path === `/natilleras/${natillera.id}/actividades` }"
                    @click="cerrarDesplegable"
                  >
                    <CalendarIcon class="w-5 h-5" />
                    <span>Actividades</span>
                  </router-link>
                  <router-link
                    :to="`/natilleras/${natillera.id}/configuracion`"
                    class="nav-link-sub"
                    :class="{ 'nav-link-sub-active': $route.path === `/natilleras/${natillera.id}/configuracion` }"
                    @click="cerrarDesplegable"
                  >
                    <Cog6ToothIcon class="w-5 h-5" />
                    <span>Configuración</span>
                  </router-link>
                </div>
              </Transition>
            </div>
          </template>
          <div v-else class="px-4 py-2">
            <p class="text-xs text-emerald-100/70 italic">No hay natilleras activas</p>
          </div>

          <!-- Nueva Natillera -->
          <router-link 
            to="/natilleras/crear" 
            class="nav-link"
            @click="cerrarSidebar"
          >
            <PlusCircleIcon class="w-5 h-5" />
            <span>Nueva Natillera</span>
          </router-link>

          <!-- Invitaciones Pendientes -->
          <div class="pt-4">
            <InvitacionesPendientes />
          </div>

        </nav>

      </div>
    </aside>

    <!-- Usuario - Siempre visible fijo en la parte inferior izquierda -->
    <div 
      :class="[
        'fixed bottom-0 left-0 w-72 p-3 z-50 transition-all duration-300',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      ]"
    >
      <div class="user-panel group">
        <!-- Efecto de brillo animado en hover -->
        <div class="absolute inset-0 rounded-2xl bg-gradient-to-r from-natillera-400/0 via-white/30 to-natillera-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -translate-x-full group-hover:translate-x-full pointer-events-none"></div>
        
        <div class="relative flex items-center gap-3">
          <!-- Avatar con borde gradiente -->
          <div class="relative">
            <div class="absolute -inset-1 bg-gradient-to-br from-natillera-400 via-natillera-500 to-natillera-600 rounded-full opacity-75 blur-sm group-hover:opacity-100 transition-opacity"></div>
            <img 
              :src="getAvatarUrl(authStore.userEmail || authStore.userName)" 
              :alt="authStore.userName"
              class="relative w-11 h-11 rounded-full ring-2 ring-white shadow-lg"
            />
            <!-- Indicador de estado online -->
            <span class="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full shadow-lg"></span>
          </div>
          
          <!-- Info del usuario -->
          <div class="flex-1 min-w-0">
            <p class="font-semibold text-white truncate text-sm">{{ authStore.userName }}</p>
            <p class="text-xs text-emerald-100 truncate">{{ authStore.userEmail }}</p>
          </div>
          
          <!-- Botón de logout con estilo -->
          <button 
            @click="handleLogout"
            class="logout-btn group/btn"
            title="Cerrar sesión"
          >
            <ArrowRightOnRectangleIcon class="w-5 h-5 transition-transform duration-300 group-hover/btn:translate-x-0.5" />
          </button>
        </div>
      </div>
    </div>

    <!-- Overlay móvil -->
    <div 
      v-if="sidebarOpen"
      @click="sidebarOpen = false"
      class="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
    ></div>

    <!-- Contenido principal -->
    <main class="flex-1 flex flex-col min-h-screen w-full overflow-x-hidden overflow-y-auto">
      <!-- Header móvil -->
      <header class="lg:hidden sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-4 py-3 flex-shrink-0">
        <div class="flex items-center justify-between">
          <button 
            @click="sidebarOpen = true"
            class="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <Bars3Icon class="w-6 h-6" />
          </button>
          <h1 class="font-display font-bold text-lg">
            <AppBrand />
          </h1>
          <div class="w-10"></div>
        </div>
      </header>

      <!-- Contenido de la página -->
      <div 
        class="flex-1 p-3 sm:p-4 lg:p-8 w-full min-h-0"
        :class="route.params.id ? 'pb-20 lg:pb-3' : 'pb-3'"
      >
        <router-view />
      </div>
    </main>

    <!-- Navegación inferior móvil -->
    <MobileBottomNav />

    <!-- Indicador de modo desarrollo -->
    <div 
      v-if="isDevMode"
      class="fixed top-4 right-4 z-[100] dev-badge"
      title="Modo desarrollo activo"
    >
      <div class="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-full shadow-lg shadow-orange-500/30 border border-amber-400/50">
        <span class="relative flex h-2 w-2">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span class="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
        </span>
        DEV MODE
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useNatillerasStore } from '../stores/natilleras'
import { useSupportStore } from '../stores/support'
import { useNotificationStore } from '../stores/notifications'
import { isDev, isLocalhost } from '../config/environment'

// Detectar modo desarrollo
const isDevMode = isDev || isLocalhost
import { 
  HomeIcon, 
  BanknotesIcon, 
  PlusCircleIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  Cog6ToothIcon,
  ChevronDownIcon,
  UsersIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  ClipboardDocumentListIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  ShareIcon
} from '@heroicons/vue/24/outline'
import InvitacionesPendientes from '../components/InvitacionesPendientes.vue'
import MobileBottomNav from '../components/MobileBottomNav.vue'
import AppBrand from '../components/AppBrand.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const natillerasStore = useNatillerasStore()
const supportStore = useSupportStore()
const notificationStore = useNotificationStore()
const sidebarOpen = ref(false)
const natilleraExpandida = ref(null)
const previousUnreadCount = ref(0)
const tooltipVisible = ref(null) // ID de la natillera cuyo tooltip está visible en móvil

// Verificar si el usuario es admin (raigo.16@gmail.com)
const isAdmin = computed(() => {
  return authStore.userEmail === 'raigo.16@gmail.com'
})

// Todas las natilleras activas (propias y compartidas) sin duplicados
const todasLasNatillerasActivas = computed(() => {
  // Obtener IDs de natilleras compartidas activas para evitar duplicados
  const idsCompartidas = new Set(
    natillerasStore.natillerasCompartidasActivas.map(n => n.id)
  )
  
  // Obtener natilleras propias activas que NO estén en compartidas
  const propiasSinDuplicar = natillerasStore.natillerasActivas
    .filter(n => !idsCompartidas.has(n.id))
    .map(n => ({ ...n, es_propia: true, mi_rol: 'administrador' }))
  
  // Obtener natilleras compartidas activas
  const compartidas = natillerasStore.natillerasCompartidasActivas
    .map(n => ({ ...n, es_propia: false }))
  
  // Combinar ambas listas (priorizando compartidas si están duplicadas)
  return [...compartidas, ...propiasSinDuplicar]
})

function getAvatarUrl(seed) {
  const encodedSeed = encodeURIComponent(seed || 'default')
  return `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodedSeed}&backgroundColor=c0aede,d1d4f9,b6e3f4,ffd5dc,ffdfbf`
}

function cerrarSidebar() {
  // Solo cerrar en móvil (cuando el sidebar está en modo overlay)
  if (window.innerWidth < 1024) {
    sidebarOpen.value = false
  }
}

function toggleNatillera(natilleraId) {
  if (natilleraExpandida.value === natilleraId) {
    natilleraExpandida.value = null
  } else {
    natilleraExpandida.value = natilleraId
  }
}

function cerrarDesplegable() {
  natilleraExpandida.value = null
  cerrarSidebar()
}

function mostrarTooltip(natilleraId, event) {
  // Solo mostrar tooltip en móvil (pantallas pequeñas)
  if (window.innerWidth < 1024) {
    if (tooltipVisible.value === natilleraId) {
      // Si ya está visible, cerrarlo (primer tap mostró tooltip, segundo tap lo cierra)
      tooltipVisible.value = null
      return
    }
    
    // Cerrar otros tooltips si hay alguno abierto
    if (tooltipVisible.value !== null) {
      tooltipVisible.value = null
    }
    
    // Mostrar el nuevo tooltip
    tooltipVisible.value = natilleraId
    
    // Cerrar automáticamente después de 4 segundos
    setTimeout(() => {
      if (tooltipVisible.value === natilleraId) {
        tooltipVisible.value = null
      }
    }, 4000)
  }
}

function navegarANatillera(natilleraId) {
  // En móvil: si el tooltip está visible, cerrarlo pero no navegar (el usuario solo quería ver el nombre)
  if (window.innerWidth < 1024 && tooltipVisible.value === natilleraId) {
    tooltipVisible.value = null
    // Esperar un momento antes de permitir navegación para evitar navegación accidental
    return
  }
  
  // Cerrar tooltip si está visible
  if (tooltipVisible.value === natilleraId) {
    tooltipVisible.value = null
  }
  
  const nuevaRuta = `/natilleras/${natilleraId}`
  const idActual = router.currentRoute.value.params.id
  
  // Siempre navegar si el ID es diferente
  if (idActual !== String(natilleraId)) {
    router.push(nuevaRuta)
  } else {
    // Si ya estás en esa natillera pero en una subruta, navegar a la vista principal
    const rutaActual = router.currentRoute.value.path
    if (rutaActual !== nuevaRuta) {
      router.push(nuevaRuta)
    }
  }
  cerrarSidebar()
}

async function handleLogout() {
  await authStore.logout()
  router.push('/auth/login')
}

// Watch para detectar nuevos mensajes y mostrar notificación
watch(() => supportStore.unreadCount, (newCount, oldCount) => {
  // Solo mostrar notificación si hay nuevos mensajes (aumentó el contador)
  // y no es la primera carga (oldCount > 0)
  if (newCount > oldCount && oldCount > 0 && isAdmin.value) {
    notificationStore.info(
      `Tienes ${newCount} ${newCount === 1 ? 'mensaje' : 'mensajes'} sin responder en soporte`,
      'Nuevos mensajes',
      8000
    )
  }
  previousUnreadCount.value = newCount
})

// Cerrar tooltip al hacer click fuera o al tocar fuera
function cerrarTooltipSiEsNecesario(event) {
  // Solo en móvil
  if (window.innerWidth < 1024 && tooltipVisible.value !== null) {
    // Si el click/touch no fue dentro de un elemento con tooltip o el botón
    const target = event.target
    const tieneTooltip = target.closest('.group') || target.closest('.nav-link')
    if (!tieneTooltip) {
      tooltipVisible.value = null
    }
  }
}

onMounted(async () => {
  // Cargar todas las natilleras (propias y compartidas)
  await natillerasStore.fetchTodasLasNatilleras()
  
  // Iniciar verificación de mensajes si es admin
  if (isAdmin.value) {
    supportStore.startChecking()
    previousUnreadCount.value = supportStore.unreadCount
  }
  
  // Agregar listener para cerrar tooltip al tocar fuera (móvil)
  document.addEventListener('touchstart', cerrarTooltipSiEsNecesario)
  document.addEventListener('click', cerrarTooltipSiEsNecesario)
})

onUnmounted(() => {
  // Detener verificación al desmontar
  supportStore.stopChecking()
  // Remover listeners
  document.removeEventListener('touchstart', cerrarTooltipSiEsNecesario)
  document.removeEventListener('click', cerrarTooltipSiEsNecesario)
})
</script>

<style scoped>
@reference "../style.css";

.nav-link {
  @apply flex items-center gap-3 px-4 py-3 text-emerald-100 rounded-xl hover:bg-white/15 hover:text-white transition-all duration-200;
}

.nav-link-active {
  @apply bg-white/30 text-white shadow-xl shadow-black/30 backdrop-blur-sm border-2 border-white/40 hover:bg-white/35 hover:text-white font-semibold;
}


.nav-link-sub {
  @apply flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-emerald-100 rounded-lg hover:bg-white/10 hover:text-white transition-all duration-200 border border-transparent hover:border-white/20;
}

.nav-link-sub-active {
  @apply bg-white/25 text-white font-semibold border-white/40 shadow-md backdrop-blur-sm;
}

/* Panel de usuario fijo */
.user-panel {
  @apply relative p-3.5 rounded-2xl overflow-hidden;
  @apply bg-white/15 backdrop-blur-xl;
  @apply border border-white/20;
  @apply shadow-xl shadow-black/30;
  @apply transition-all duration-300;
}

.user-panel:hover {
  @apply shadow-2xl shadow-black/40;
  @apply border-white/30;
  @apply bg-white/20;
  transform: translateY(-2px);
}

/* Botón de logout elegante */
.logout-btn {
  @apply relative p-2.5 rounded-xl overflow-hidden;
  @apply text-emerald-100;
  @apply transition-all duration-300;
  @apply border border-transparent;
}

.logout-btn:hover {
  @apply text-white;
  @apply bg-gradient-to-br from-rose-500 to-red-600;
  @apply border-rose-400/50;
  @apply shadow-lg shadow-rose-500/30;
  transform: scale(1.05);
}

.logout-btn:active {
  transform: scale(0.95);
}
</style>


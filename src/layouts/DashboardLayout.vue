<template>
  <div class="min-h-screen flex">
    <!-- Sidebar -->
    <aside 
      :class="[
        'fixed inset-y-0 left-0 z-50 w-72 bg-white/90 backdrop-blur-xl border-r border-gray-100 transform transition-transform duration-300 lg:translate-x-0 lg:static',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      ]"
    >
      <div class="flex flex-col h-full">
        <!-- Logo -->
        <div class="p-6 border-b border-gray-100">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 bg-gradient-to-br from-natillera-500 to-natillera-700 rounded-xl flex items-center justify-center shadow-lg shadow-natillera-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h1 class="font-display font-bold text-xl text-gray-800">Natillera</h1>
              <p class="text-xs text-gray-400">Gestión comunitaria</p>
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
            <p class="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Accesos Rápidos</p>
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
                class="flex items-center gap-2 pr-1 rounded-xl px-1 py-1 transition-all duration-200"
                :class="[
                  !natillera.es_propia 
                    ? 'bg-gradient-to-r from-blue-100 via-indigo-100 to-blue-100 border-2 border-blue-400 shadow-sm' 
                    : ''
                ]"
              >
                <!-- Link a la vista de detalle -->
                <button
                  @click="navegarANatillera(natillera.id)"
                  class="nav-link flex-1 min-w-0 text-left"
                  :class="[
                    { 'nav-link-active': $route.params.id === String(natillera.id) && $route.path.startsWith(`/natilleras/${natillera.id}`) },
                    !natillera.es_propia ? 'hover:bg-blue-200/60' : ''
                  ]"
                >
                  <BanknotesIcon class="w-5 h-5 flex-shrink-0" />
                  <span class="truncate flex-1 text-left">{{ natillera.nombre }}</span>
                </button>
                
                <!-- Botón para abrir/cerrar desplegable -->
                <button
                  @click.stop="toggleNatillera(natillera.id)"
                  :class="[
                    'p-2.5 rounded-xl transition-all duration-300 flex-shrink-0 shadow-lg border-2 relative z-10',
                    natilleraExpandida === natillera.id
                      ? !natillera.es_propia
                        ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 border-blue-400 shadow-blue-500/40'
                        : 'bg-gradient-to-br from-natillera-500 to-natillera-600 text-white hover:from-natillera-600 hover:to-natillera-700 border-natillera-400 shadow-natillera-500/40'
                      : !natillera.es_propia
                        ? 'bg-white text-blue-600 hover:bg-blue-50 border-blue-200 hover:border-blue-300 hover:shadow-xl'
                        : 'bg-white text-natillera-600 hover:bg-natillera-50 border-natillera-200 hover:border-natillera-300 hover:shadow-xl'
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
                  :class="[
                    'ml-2 mr-2 mt-2 mb-2 p-3 rounded-xl border-2 shadow-lg space-y-1.5 overflow-hidden',
                    !natillera.es_propia
                      ? 'bg-gradient-to-br from-blue-50 via-white to-indigo-50 border-blue-200'
                      : 'bg-gradient-to-br from-natillera-50 via-white to-gray-50 border-natillera-200'
                  ]"
                >
                  <div 
                    :class="[
                      'text-xs font-semibold uppercase tracking-wider mb-2 px-2',
                      !natillera.es_propia ? 'text-blue-700' : 'text-natillera-700'
                    ]"
                  >
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
            <p class="text-xs text-gray-400 italic">No hay natilleras activas</p>
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
            <p class="font-semibold text-gray-800 truncate text-sm">{{ authStore.userName }}</p>
            <p class="text-xs text-gray-500 truncate">{{ authStore.userEmail }}</p>
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
          <h1 class="font-display font-bold text-lg text-gray-800">Natillera</h1>
          <div class="w-10"></div>
        </div>
      </header>

      <!-- Contenido de la página -->
      <div class="flex-1 p-3 sm:p-4 lg:p-8 w-full min-h-0">
        <router-view />
      </div>
    </main>

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
import { useRouter } from 'vue-router'
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
  ChatBubbleLeftRightIcon
} from '@heroicons/vue/24/outline'
import InvitacionesPendientes from '../components/InvitacionesPendientes.vue'

const router = useRouter()
const authStore = useAuthStore()
const natillerasStore = useNatillerasStore()
const supportStore = useSupportStore()
const notificationStore = useNotificationStore()
const sidebarOpen = ref(false)
const natilleraExpandida = ref(null)
const previousUnreadCount = ref(0)

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

function navegarANatillera(natilleraId) {
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

onMounted(async () => {
  // Cargar todas las natilleras (propias y compartidas)
  await natillerasStore.fetchTodasLasNatilleras()
  
  // Iniciar verificación de mensajes si es admin
  if (isAdmin.value) {
    supportStore.startChecking()
    previousUnreadCount.value = supportStore.unreadCount
  }
})

onUnmounted(() => {
  // Detener verificación al desmontar
  supportStore.stopChecking()
})
</script>

<style scoped>
@reference "../style.css";

.nav-link {
  @apply flex items-center gap-3 px-4 py-3 text-gray-600 rounded-xl hover:bg-natillera-50 hover:text-natillera-700 transition-all duration-200;
}

.nav-link-active {
  @apply bg-gradient-to-r from-natillera-500 to-natillera-600 text-white shadow-lg shadow-natillera-500/25 hover:bg-natillera-600 hover:text-white;
}

.nav-link-sub {
  @apply flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 rounded-lg hover:bg-natillera-100 hover:text-natillera-700 transition-all duration-200 border border-transparent hover:border-natillera-200;
}

.nav-link-sub-active {
  @apply bg-natillera-100 text-natillera-700 font-semibold border-natillera-300 shadow-sm;
}

/* Panel de usuario fijo */
.user-panel {
  @apply relative p-3.5 rounded-2xl overflow-hidden;
  @apply bg-gradient-to-br from-white via-natillera-50/50 to-white;
  @apply border border-natillera-200/60;
  @apply shadow-lg shadow-natillera-500/10;
  @apply backdrop-blur-xl;
  @apply transition-all duration-300;
}

.user-panel:hover {
  @apply shadow-xl shadow-natillera-500/20;
  @apply border-natillera-300/80;
  transform: translateY(-2px);
}

/* Botón de logout elegante */
.logout-btn {
  @apply relative p-2.5 rounded-xl overflow-hidden;
  @apply text-gray-400;
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


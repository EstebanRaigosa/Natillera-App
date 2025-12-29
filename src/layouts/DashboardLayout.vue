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
        <nav class="flex-1 p-4 space-y-1 overflow-y-auto">
          <router-link 
            to="/dashboard" 
            class="nav-link"
            :class="{ 'nav-link-active': $route.path === '/dashboard' }"
            @click="cerrarSidebar"
          >
            <HomeIcon class="w-5 h-5" />
            <span>Inicio</span>
          </router-link>

          <router-link 
            to="/natilleras" 
            class="nav-link"
            :class="{ 'nav-link-active': $route.path === '/natilleras' }"
            @click="cerrarSidebar"
          >
            <BanknotesIcon class="w-5 h-5" />
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

          <div class="pt-4 pb-2">
            <p class="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Accesos Rápidos</p>
          </div>

          <!-- Natilleras Activas -->
          <div v-if="natillerasStore.loading" class="px-4 py-2">
            <p class="text-xs text-gray-400">Cargando...</p>
          </div>
          <template v-else-if="natillerasStore.natillerasActivas.length > 0">
            <div 
              v-for="natillera in natillerasStore.natillerasActivas" 
              :key="natillera.id"
              class="space-y-1"
            >
              <!-- Contenedor principal de la natillera -->
              <div class="flex items-center gap-2 pr-1">
                <!-- Link a la vista de detalle -->
                <router-link
                  :to="`/natilleras/${natillera.id}`"
                  class="nav-link flex-1 min-w-0"
                  :class="{ 'nav-link-active': $route.params.id === String(natillera.id) && $route.path === `/natilleras/${natillera.id}` }"
                  @click="cerrarSidebar"
                >
                  <BanknotesIcon class="w-5 h-5 flex-shrink-0" />
                  <span class="truncate flex-1 text-left">{{ natillera.nombre }}</span>
                </router-link>
                
                <!-- Botón para abrir/cerrar desplegable -->
                <button
                  @click.stop="toggleNatillera(natillera.id)"
                  :class="[
                    'p-2.5 rounded-xl transition-all duration-300 flex-shrink-0 shadow-lg border-2 relative z-10',
                    natilleraExpandida === natillera.id
                      ? 'bg-gradient-to-br from-natillera-500 to-natillera-600 text-white hover:from-natillera-600 hover:to-natillera-700 border-natillera-400 shadow-natillera-500/40'
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
                  class="ml-2 mr-2 mt-2 mb-2 p-3 bg-gradient-to-br from-natillera-50 via-white to-gray-50 rounded-xl border-2 border-natillera-200 shadow-lg space-y-1.5 overflow-hidden"
                >
                  <div class="text-xs font-semibold text-natillera-700 uppercase tracking-wider mb-2 px-2">
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

        </nav>

        <!-- Usuario -->
        <div class="p-4 border-t border-gray-100">
          <div class="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
            <img 
              :src="getAvatarUrl(authStore.userEmail || authStore.userName)" 
              :alt="authStore.userName"
              class="w-10 h-10 rounded-full bg-accent-100"
            />
            <div class="flex-1 min-w-0">
              <p class="font-medium text-gray-800 truncate">{{ authStore.userName }}</p>
              <p class="text-xs text-gray-400 truncate">{{ authStore.userEmail }}</p>
            </div>
            <button 
              @click="handleLogout"
              class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Cerrar sesión"
            >
              <ArrowRightOnRectangleIcon class="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </aside>

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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useNatillerasStore } from '../stores/natilleras'
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
  ClipboardDocumentListIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const authStore = useAuthStore()
const natillerasStore = useNatillerasStore()
const sidebarOpen = ref(false)
const natilleraExpandida = ref(null)

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

async function handleLogout() {
  await authStore.logout()
  router.push('/auth/login')
}

onMounted(async () => {
  // Cargar natilleras al montar el componente
  await natillerasStore.fetchNatilleras()
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
</style>


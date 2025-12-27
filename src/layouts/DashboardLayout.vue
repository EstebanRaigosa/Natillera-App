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
          >
            <HomeIcon class="w-5 h-5" />
            <span>Inicio</span>
          </router-link>

          <router-link 
            to="/natilleras" 
            class="nav-link"
            :class="{ 'nav-link-active': $route.path.startsWith('/natilleras') }"
          >
            <BanknotesIcon class="w-5 h-5" />
            <span>Mis Natilleras</span>
          </router-link>

          <div class="pt-4 pb-2">
            <p class="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Accesos Rápidos</p>
          </div>

          <router-link 
            to="/natilleras/crear" 
            class="nav-link"
          >
            <PlusCircleIcon class="w-5 h-5" />
            <span>Nueva Natillera</span>
          </router-link>

          <div class="pt-4 pb-2">
            <p class="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Ajustes</p>
          </div>

          <router-link 
            to="/configuracion" 
            class="nav-link"
            :class="{ 'nav-link-active': $route.path === '/configuracion' }"
          >
            <Cog6ToothIcon class="w-5 h-5" />
            <span>Configuración</span>
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
    <main class="flex-1 flex flex-col min-h-screen w-full overflow-x-hidden">
      <!-- Header móvil -->
      <header class="lg:hidden sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-4 py-3">
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
      <div class="flex-1 p-3 sm:p-4 lg:p-8 w-full overflow-x-hidden">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { 
  HomeIcon, 
  BanknotesIcon, 
  PlusCircleIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  Cog6ToothIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const authStore = useAuthStore()
const sidebarOpen = ref(false)

function getAvatarUrl(seed) {
  const encodedSeed = encodeURIComponent(seed || 'default')
  return `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodedSeed}&backgroundColor=c0aede,d1d4f9,b6e3f4,ffd5dc,ffdfbf`
}

async function handleLogout() {
  await authStore.logout()
  router.push('/auth/login')
}
</script>

<style scoped>
@reference "../style.css";

.nav-link {
  @apply flex items-center gap-3 px-4 py-3 text-gray-600 rounded-xl hover:bg-natillera-50 hover:text-natillera-700 transition-all duration-200;
}

.nav-link-active {
  @apply bg-gradient-to-r from-natillera-500 to-natillera-600 text-white shadow-lg shadow-natillera-500/25 hover:bg-natillera-600 hover:text-white;
}
</style>


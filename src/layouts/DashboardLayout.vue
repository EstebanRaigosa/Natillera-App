<template>
  <div class="min-h-screen flex">
    <!-- Área de activación hover (solo en lg, 1024px-1279px) -->
    <div 
      v-if="isLgScreen && !sidebarHover"
      @mouseenter="sidebarHover = true; hoverAreaActive = true"
      @mouseleave="hoverAreaActive = false"
      class="fixed inset-y-0 left-0 w-5 z-50 group cursor-pointer"
      style="background: transparent;"
    >
      <!-- Indicador visual -->
      <div 
        class="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-28 bg-gradient-to-r from-natillera-500/90 to-emerald-500/90 backdrop-blur-sm rounded-r-xl flex items-center justify-center shadow-xl border-r-2 border-natillera-400/60 transition-all duration-300 group-hover:from-natillera-500 group-hover:to-emerald-500 group-hover:w-6 group-hover:h-32 group-hover:shadow-2xl"
      >
        <ChevronRightIcon class="w-5 h-5 text-white transition-all duration-300 group-hover:scale-110" :class="hoverAreaActive ? 'animate-pulse' : 'animate-pulse'" />
      </div>
    </div>
    
    <!-- Sidebar -->
    <aside 
      @mouseenter="clearSidebarTimeout(); sidebarHover = true; hoverAreaActive = false"
      @mouseleave="startSidebarTimeout()"
      :class="[
        'fixed inset-y-0 left-0 z-50 w-72 bg-gradient-to-br from-natillera-700 via-emerald-700 to-teal-700 backdrop-blur-xl border-r border-emerald-600/30 transform transition-transform duration-300',
        // En pantallas xl (1280px+): siempre visible y estático
        'xl:translate-x-0 xl:static',
        // En lg (1024px-1279px): oculto por defecto, visible con hover
        // En móvil/tablet (<1024px): controlado por sidebarOpen
        (sidebarOpen || (isLgScreen && sidebarHover)) ? 'translate-x-0' : '-translate-x-full'
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
        <nav class="flex-1 p-4 space-y-4 overflow-y-auto pb-24">
          <!-- Móvil: acceso al listado de natilleras (dashboard); el resto del menú va en la barra inferior -->
          <div class="sidebar-section lg:hidden">
            <button
              type="button"
              class="nav-link nav-link-option w-full text-left"
              :class="{ 'nav-link-active': route.name === 'Dashboard' }"
              @click="abrirRutaDesdeSidebar({ name: 'Dashboard' })"
            >
              <RectangleStackIcon class="w-5 h-5 shrink-0" />
              <span class="sidebar-option-label">Mis Natilleras</span>
            </button>
          </div>

          <!-- Menú (solo escritorio): Mis Natilleras + vistas de la natillera actual -->
          <div class="sidebar-section hidden lg:block space-y-1">
            <p class="sidebar-section-heading">Menú</p>
            <button
              type="button"
              class="nav-link nav-link-option w-full text-left"
              :class="{ 'nav-link-active': route.name === 'Dashboard' }"
              @click="abrirRutaDesdeSidebar({ name: 'Dashboard' })"
            >
              <RectangleStackIcon class="w-5 h-5 shrink-0" />
              <span class="sidebar-option-label">Mis Natilleras</span>
            </button>
            <template v-if="natilleraIdRuta">
              <button
                type="button"
                class="nav-link nav-link-option w-full text-left"
                :class="{ 'nav-link-active': route.path === '/natilleras/' + natilleraIdRuta }"
                @click="abrirRutaDesdeSidebar('/natilleras/' + natilleraIdRuta)"
              >
                <HomeIcon class="w-5 h-5 shrink-0" />
                <span class="sidebar-option-label">Inicio</span>
              </button>
              <button
                type="button"
                class="nav-link nav-link-option w-full text-left"
                :class="{ 'nav-link-active': route.path.startsWith('/natilleras/' + natilleraIdRuta + '/socios') }"
                @click="abrirRutaDesdeSidebar('/natilleras/' + natilleraIdRuta + '/socios')"
              >
                <UsersIcon class="w-5 h-5 shrink-0" />
                <span class="sidebar-option-label">Socios</span>
              </button>
              <button
                type="button"
                class="nav-link nav-link-option w-full text-left"
                :class="{ 'nav-link-active': route.path.startsWith('/natilleras/' + natilleraIdRuta + '/cuotas') }"
                @click="abrirRutaDesdeSidebar('/natilleras/' + natilleraIdRuta + '/cuotas')"
              >
                <CurrencyDollarIcon class="w-5 h-5 shrink-0" />
                <span class="sidebar-option-label">Cuotas</span>
              </button>
              <button
                type="button"
                class="nav-link nav-link-option w-full text-left"
                :class="{ 'nav-link-active': route.path.startsWith('/natilleras/' + natilleraIdRuta + '/prestamos') }"
                @click="abrirRutaDesdeSidebar('/natilleras/' + natilleraIdRuta + '/prestamos')"
              >
                <BanknotesIcon class="w-5 h-5 shrink-0" />
                <span class="sidebar-option-label">Préstamos</span>
              </button>
              <button
                type="button"
                class="nav-link nav-link-option w-full text-left"
                :class="{ 'nav-link-active': route.path.startsWith('/natilleras/' + natilleraIdRuta + '/actividades') }"
                @click="abrirRutaDesdeSidebar('/natilleras/' + natilleraIdRuta + '/actividades')"
              >
                <CalendarIcon class="w-5 h-5 shrink-0" />
                <span class="sidebar-option-label">Actividades</span>
              </button>
              <button
                type="button"
                class="nav-link nav-link-option w-full text-left"
                :class="{ 'nav-link-active': route.path.startsWith('/natilleras/' + natilleraIdRuta + '/cuadre-caja') }"
                @click="abrirRutaDesdeSidebar('/natilleras/' + natilleraIdRuta + '/cuadre-caja')"
              >
                <CalculatorIcon class="w-5 h-5 shrink-0" />
                <span class="sidebar-option-label">Totales</span>
              </button>
            </template>
          </div>

          <!-- Acciones de la natillera actual (barra lateral; en detalle ya no se muestran) -->
          <div
            v-if="natilleraIdRuta"
            id="tour-acciones-natillera"
            class="sidebar-section space-y-1"
          >
            <p class="sidebar-section-heading">Acciones Natillera</p>
            <button
              v-if="puedeAccionSidebar('buscar_comprobante')"
              type="button"
              class="nav-link nav-link-option w-full text-left"
              @click="ejecutarAccionNatillera('buscar')"
            >
              <MagnifyingGlassIcon class="w-5 h-5 shrink-0" />
              <span class="sidebar-option-label">Buscar Comprobante</span>
            </button>
            <button
              v-if="puedeAccionSidebar('invitar_colaboradores')"
              type="button"
              class="nav-link nav-link-option w-full text-left"
              @click="ejecutarAccionNatillera('invitar')"
            >
              <UserPlusIcon class="w-5 h-5 shrink-0" />
              <span class="sidebar-option-label">Invitar Colaborador</span>
            </button>
            <button
              v-if="puedeAccionSidebar('configurar')"
              type="button"
              class="nav-link nav-link-option w-full text-left"
              @click="abrirRutaDesdeSidebar('/natilleras/' + natilleraIdRuta + '/configuracion')"
            >
              <Cog6ToothIcon class="w-5 h-5 shrink-0" />
              <span class="sidebar-option-label">Configurar</span>
            </button>
            <button
              v-if="puedeAccionSidebar('notificar')"
              type="button"
              class="nav-link nav-link-option w-full text-left"
              @click="ejecutarAccionNatillera('notificar')"
            >
              <ChatBubbleLeftRightIcon class="w-5 h-5 shrink-0" />
              <span class="sidebar-option-label">Notificar</span>
            </button>
            <button
              v-if="puedeAccionSidebar('cerrar_natillera')"
              type="button"
              class="nav-link nav-link-option w-full text-left text-rose-100 hover:text-white"
              @click="ejecutarAccionNatillera('cerrar')"
            >
              <DocumentCheckIcon class="w-5 h-5 shrink-0" />
              <span class="sidebar-option-label">Cerrar Natillera</span>
            </button>
          </div>

          <!-- Invitaciones pendientes -->
          <div v-if="hayInvitacionesPendientes" class="sidebar-section space-y-2">
            <div class="flex items-center justify-between gap-2 px-1">
              <p class="sidebar-section-heading !mb-0 !border-0 !pb-0">Invitaciones</p>
              <span class="rounded-full bg-white/15 px-2 py-0.5 text-xs font-bold text-emerald-50 tabular-nums">
                {{ colaboradoresStore.misInvitaciones.length }}
              </span>
            </div>
            <InvitacionesPendientes omit-outer-heading />
          </div>

          <!-- Administrador (solo cuenta principal) -->
          <div v-if="isSuperAdmin" class="sidebar-section space-y-1">
            <p class="sidebar-section-heading">Administrador</p>
            <button
              type="button"
              class="nav-link nav-link-option w-full text-left"
              :class="{ 'nav-link-active': route.path === '/auditoria' }"
              @click="abrirRutaDesdeSidebar('/auditoria')"
            >
              <ClipboardDocumentListIcon class="w-5 h-5 shrink-0" />
              <span class="sidebar-option-label">Auditoría</span>
            </button>
            <button
              type="button"
              class="nav-link nav-link-option relative w-full text-left"
              :class="{ 'nav-link-active': route.path === '/admin/chat' }"
              @click="supportStore.resetUnreadCount(); abrirRutaDesdeSidebar('/admin/chat')"
            >
              <ChatBubbleLeftRightIcon class="w-5 h-5 shrink-0" />
              <span class="sidebar-option-label">Soporte</span>
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
                  v-if="supportStore.hasUnreadMessages && route.path !== '/admin/chat'"
                  :key="`badge-${supportStore.unreadCount}`"
                  class="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 bg-gradient-to-r from-red-500 to-rose-600 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg border-2 border-white animate-pulse"
                >
                  {{ supportStore.unreadCount > 99 ? '99+' : supportStore.unreadCount }}
                </span>
              </Transition>
            </button>
            <button
              type="button"
              class="nav-link nav-link-option w-full text-left"
              :class="{ 'nav-link-active': route.path === '/admin/data' }"
              @click="abrirRutaDesdeSidebar('/admin/data')"
            >
              <CircleStackIcon class="w-5 h-5 shrink-0" />
              <span class="sidebar-option-label">Datos Db</span>
            </button>
          </div>
        </nav>

      </div>
    </aside>

    <!-- Usuario - Siempre visible fijo en la parte inferior izquierda -->
    <div 
      @mouseenter="handleUserPanelMouseEnter"
      @mouseleave="handleUserPanelMouseLeave"
      :class="[
        'fixed bottom-0 left-0 w-72 p-3 z-50 transition-all duration-300',
        // En xl (1280px+): siempre visible
        'xl:translate-x-0',
        // En lg (1024px-1279px): visible con hover
        // En móvil: controlado por sidebarOpen
        (sidebarOpen || (isLgScreen && sidebarHover)) ? 'translate-x-0' : '-translate-x-full'
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

    <!-- Wrapper del contenido: z-50 cuando hay modal abierta para que quede por encima de la barra inferior (z-40) -->
    <div 
      class="flex-1 flex flex-col min-w-0 min-h-screen relative"
      :class="{ 'z-50': isBodyScrollLocked }"
    >
      <!-- Contenido principal -->
      <main class="flex-1 flex flex-col min-h-screen w-full overflow-x-hidden overflow-y-auto">
        <!-- Header móvil -->
        <header class="lg:hidden sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-4 py-3 flex-shrink-0">
          <div class="flex items-center justify-between">
            <button
              id="tour-hamburger-btn"
              type="button"
              @click="sidebarOpen = true"
              class="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Abrir menú"
            >
              <Bars3Icon class="w-6 h-6" />
            </button>
            <h1 class="font-display font-bold text-lg">
              <AppBrand />
            </h1>
            <div class="w-10"></div>
          </div>
        </header>

        <!-- Contenido de la página: reservar espacio hasta donde empieza la barra inferior en móvil -->
        <div 
          class="flex-1 p-3 sm:p-4 lg:p-5 xl:p-8 w-full min-h-0"
          :class="route.params.id ? 'content-above-bottom-nav lg:pb-3' : 'pb-3'"
        >
          <router-view />
        </div>
      </main>
    </div>

    <!-- Overlay móvil: después del contenido para capturar clics fuera (por encima del área principal) -->
    <div
      v-if="sidebarOpen && !isLgScreen"
      class="sidebar-overlay fixed inset-0 z-[45] bg-black/25 backdrop-blur-sm lg:hidden"
      role="presentation"
      aria-hidden="true"
      @click="cerrarSidebar"
    ></div>

    <!-- Navegación inferior móvil (oculta mientras el cajón lateral está abierto) -->
    <MobileBottomNav :force-hidden="sidebarOpen && esViewportMovil" />

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
import { ref, computed, onMounted, onUnmounted, watch, provide } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useNatillerasStore } from '../stores/natilleras'
import { useColaboradoresStore } from '../stores/colaboradores'
import { useSupportStore } from '../stores/support'
import { useNotificationStore } from '../stores/notifications'
import { isDev, isLocalhost } from '../config/environment'
import { requestNatilleraSidebarAction } from '../composables/useNatilleraSidebarActions'

// Detectar modo desarrollo
const isDevMode = isDev || isLocalhost
import { 
  HomeIcon, 
  BanknotesIcon, 
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  Cog6ToothIcon,
  ChevronRightIcon,
  UsersIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  ClipboardDocumentListIcon,
  ChatBubbleLeftRightIcon,
  CalculatorIcon,
  MagnifyingGlassIcon,
  DocumentCheckIcon,
  UserPlusIcon,
  CircleStackIcon,
  RectangleStackIcon
} from '@heroicons/vue/24/outline'
import { isBodyScrollLocked } from '../composables/useBodyScrollLock'
import InvitacionesPendientes from '../components/InvitacionesPendientes.vue'
import MobileBottomNav from '../components/MobileBottomNav.vue'
import AppBrand from '../components/AppBrand.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const natillerasStore = useNatillerasStore()
const colaboradoresStore = useColaboradoresStore()
const supportStore = useSupportStore()
const notificationStore = useNotificationStore()
const sidebarOpen = ref(false)
const sidebarHover = ref(false) // Para controlar el hover en pantallas lg (1024px)
const hoverAreaActive = ref(false) // Para mostrar el indicador cuando el mouse está cerca
const previousUnreadCount = ref(0)
const isLgScreen = ref(false) // Detecta si estamos en breakpoint lg (1024px)
/** Viewport &lt; 1024px: barra inferior móvil y overlay del menú */
const esViewportMovil = ref(false)
let sidebarHoverTimeout = null // Timeout para cerrar el sidebar con delay

const permisosNatilleraSidebar = ref(null)

const natilleraIdRuta = computed(() => {
  const id = route.params.id
  if (!id || id === 'undefined' || id === 'null') return null
  return String(id)
})

// Todas las natilleras activas (propias y compartidas) sin duplicados
const todasLasNatillerasActivas = computed(() => {
  const idsCompartidas = new Set(
    natillerasStore.natillerasCompartidasActivas.map(n => n.id)
  )

  const propiasSinDuplicar = natillerasStore.natillerasActivas
    .filter(n => !idsCompartidas.has(n.id))
    .map(n => ({ ...n, es_propia: true, mi_rol: 'administrador' }))

  const compartidas = natillerasStore.natillerasCompartidasActivas
    .map(n => ({ ...n, es_propia: false }))

  return [...compartidas, ...propiasSinDuplicar]
})

const natilleraEnContexto = computed(() => {
  const id = natilleraIdRuta.value
  if (!id) return null
  return todasLasNatillerasActivas.value.find(n => String(n.id) === id) || null
})

const isSuperAdmin = computed(() => {
  return (authStore.userEmail || '').toLowerCase().trim() === 'raigo.16@gmail.com'
})

const hayInvitacionesPendientes = computed(
  () => (colaboradoresStore.misInvitaciones?.length || 0) > 0
)

/**
 * Permisos para la barra lateral: usa la API y, si aún no hay respuesta,
 * infiere administrador desde lista local / natillera en store (misma lógica que en vistas).
 */
const permisosEfectivosSidebar = computed(() => {
  const desdeApi = permisosNatilleraSidebar.value
  if (desdeApi) return desdeApi

  const id = natilleraIdRuta.value
  if (!id) return null

  const ctx = natilleraEnContexto.value
  const uid = authStore.user?.id
  if (!uid) return null

  if (ctx?.es_propia === true) {
    return {
      rol: 'administrador',
      esAdmin: true,
      permisos: null
    }
  }

  const na = natillerasStore.natilleraActual
  if (na && String(na.id) === id && na.admin_id === uid) {
    return { rol: 'administrador', esAdmin: true, permisos: null }
  }

  if (isSuperAdmin.value) {
    return { rol: 'administrador', esAdmin: true, permisos: null }
  }

  // Colaborador: permisos en la lista local (fetch compartidas)
  if (ctx && ctx.es_propia === false && ctx.mis_permisos) {
    return {
      rol: ctx.mi_rol || 'colaborador',
      esAdmin: false,
      permisos: ctx.mis_permisos
    }
  }

  return null
})

// No usar history.pushState/history.back() con el menú: compiten con Vue Router y pueden
// deshacer la navegación o dejar la misma URL con un “parpadeo” de recarga.

watch(
  () => route.fullPath,
  () => {
    if (typeof window === 'undefined' || window.innerWidth >= 1024) return
    if (!sidebarOpen.value) return
    sidebarOpen.value = false
  }
)

watch(
  () => natilleraIdRuta.value,
  async (id) => {
    permisosNatilleraSidebar.value = null
    if (!id) return
    try {
      permisosNatilleraSidebar.value = await colaboradoresStore.obtenerMisPermisos(id)
    } catch {
      permisosNatilleraSidebar.value = null
    }
  },
  { immediate: true }
)

// Cuando cargan las listas del store, reintentar permisos (antes el contexto no existía)
watch(
  () => todasLasNatillerasActivas.value.length,
  async () => {
    const id = natilleraIdRuta.value
    if (!id || permisosNatilleraSidebar.value) return
    try {
      permisosNatilleraSidebar.value = await colaboradoresStore.obtenerMisPermisos(id)
    } catch {
      /* se usa permisosEfectivosSidebar como respaldo */
    }
  }
)

function puedeAccionSidebar(clavePermiso) {
  const p = permisosEfectivosSidebar.value
  if (!natilleraIdRuta.value || !p) return false
  if (p.esAdmin) {
    if (clavePermiso === 'cerrar_natillera') {
      const estado =
        natilleraEnContexto.value?.estado ?? natillerasStore.natilleraActual?.estado
      return estado === 'activa'
    }
    return true
  }
  const ok = p.permisos?.[clavePermiso] === true
  if (!ok) return false
  if (clavePermiso === 'cerrar_natillera') {
    const estado =
      natilleraEnContexto.value?.estado ?? natillerasStore.natilleraActual?.estado
    return estado === 'activa'
  }
  return true
}

function ejecutarAccionNatillera(tipo) {
  const id = natilleraIdRuta.value
  if (!id) return
  if (tipo === 'cerrar') {
    router.push(`/natilleras/${id}/cierre`)
    cerrarSidebar()
    return
  }
  requestNatilleraSidebarAction(tipo, id)
  if (route.name !== 'NatilleraDetalle') {
    router.push(`/natilleras/${id}`)
  }
  cerrarSidebar()
}

function getAvatarUrl(seed) {
  const encodedSeed = encodeURIComponent(seed || 'default')
  return `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodedSeed}&backgroundColor=c0aede,d1d4f9,b6e3f4,ffd5dc,ffdfbf`
}

function cerrarSidebar() {
  if (typeof window === 'undefined' || window.innerWidth >= 1024) return
  if (!sidebarOpen.value) return
  sidebarOpen.value = false
}

function abrirSidebarMobile() {
  if (typeof window === 'undefined' || window.innerWidth >= 1024) return
  sidebarOpen.value = true
}

provide('dashboardSidebar', {
  openMobile: abrirSidebarMobile,
  closeMobile: cerrarSidebar
})

/** Navegación SPA desde el menú lateral: sin depender del `<a>` interno de RouterLink (evita choques con el historial). */
function abrirRutaDesdeSidebar(to) {
  if (typeof window !== 'undefined' && window.innerWidth < 1024) {
    sidebarOpen.value = false
  }
  return router.push(to)
}

function handleSidebarPopState() {
  if (typeof window === 'undefined' || window.innerWidth >= 1024) return
  if (sidebarOpen.value) {
    sidebarOpen.value = false
  }
}

async function handleLogout() {
  await authStore.logout()
  router.push('/auth/login')
}

// Watch para detectar nuevos mensajes y mostrar notificación
watch(() => supportStore.unreadCount, (newCount, oldCount) => {
  // Solo mostrar notificación si hay nuevos mensajes (aumentó el contador)
  // y no es la primera carga (oldCount > 0)
  if (newCount > oldCount && oldCount > 0 && isSuperAdmin.value) {
    notificationStore.info(
      `Tienes ${newCount} ${newCount === 1 ? 'mensaje' : 'mensajes'} sin responder en soporte`,
      'Nuevos mensajes',
      8000
    )
  }
  previousUnreadCount.value = newCount
})

function clearSidebarTimeout() {
  if (sidebarHoverTimeout) {
    clearTimeout(sidebarHoverTimeout)
    sidebarHoverTimeout = null
  }
}

function startSidebarTimeout() {
  clearSidebarTimeout()
  // Pequeño delay antes de cerrar para permitir movimiento del mouse entre sidebar y panel de usuario
  sidebarHoverTimeout = setTimeout(() => {
    if (isLgScreen.value) {
      sidebarHover.value = false
    }
  }, 150) // 150ms de delay
}

function handleUserPanelMouseEnter() {
  clearSidebarTimeout()
  if (isLgScreen.value) {
    sidebarHover.value = true
  }
}

function handleUserPanelMouseLeave() {
  if (isLgScreen.value) {
    startSidebarTimeout()
  }
}

function actualizarTamañoPantalla() {
  const width = window.innerWidth
  esViewportMovil.value = width < 1024
  isLgScreen.value = width >= 1024 && width < 1280
  if (width >= 1024) {
    sidebarOpen.value = false
  }
  if (!isLgScreen.value) {
    clearSidebarTimeout()
    sidebarHover.value = false
  }
}

onMounted(async () => {
  // Detectar tamaño de pantalla inicial
  actualizarTamañoPantalla()
  window.addEventListener('resize', actualizarTamañoPantalla)
  window.addEventListener('popstate', handleSidebarPopState)
  
  // Cargar todas las natilleras (propias y compartidas)
  await natillerasStore.fetchTodasLasNatilleras()
  
  if (isSuperAdmin.value) {
    supportStore.startChecking()
    previousUnreadCount.value = supportStore.unreadCount
  }
})

onUnmounted(() => {
  // Detener verificación al desmontar
  supportStore.stopChecking()
  // Limpiar timeout
  clearSidebarTimeout()
  // Remover listeners
  window.removeEventListener('resize', actualizarTamañoPantalla)
  window.removeEventListener('popstate', handleSidebarPopState)
})
</script>

<style scoped>
@reference "../style.css";

/* Reservar espacio en la parte inferior para que el contenido termine donde empieza la barra móvil */
.content-above-bottom-nav {
  padding-bottom: calc(5.5rem + env(safe-area-inset-bottom, 0px));
}

.nav-link {
  @apply flex items-center gap-3 px-4 py-3 text-emerald-100 rounded-xl hover:bg-white/15 hover:text-white transition-all duration-200;
}

.nav-link-active {
  @apply bg-white/30 text-white shadow-xl shadow-black/30 backdrop-blur-sm border-2 border-white/40 hover:bg-white/35 hover:text-white font-semibold;
}

.sidebar-section {
  @apply rounded-xl border border-white/20 bg-black/15 p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)];
}

/* Título de bloque (Menú, Acciones, …): distinto de las etiquetas de cada opción */
.sidebar-section-heading {
  @apply mb-3 border-b border-white/30 px-2 pb-2.5 text-[0.7rem] font-extrabold uppercase tracking-[0.2em] text-white drop-shadow-sm;
}

.sidebar-option-label {
  @apply text-[0.9375rem] font-medium leading-snug text-emerald-50;
}

.nav-link-option.nav-link-active .sidebar-option-label {
  @apply text-white font-semibold;
}

.nav-link-option {
  @apply py-2.5;
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


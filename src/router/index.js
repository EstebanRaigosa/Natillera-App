import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { isDev, isLocalhost, devLog } from '../config/environment'
import { resolvePostLoginLocation } from '../utils/postLoginRoute'
import { setLastNatilleraId } from '../utils/lastNatillera'

// Layouts: estáticos (se usan inmediatamente)
import AuthLayout from '../layouts/AuthLayout.vue'
import DashboardLayout from '../layouts/DashboardLayout.vue'

// Auth views: estáticas (primer paint)
import Login from '../views/auth/Login.vue'

// Todas las demás vistas: carga diferida para reducir bundle inicial
const Register = () => import('../views/auth/Register.vue')
const Welcome = () => import('../views/auth/Welcome.vue')
const ResetPassword = () => import('../views/auth/ResetPassword.vue')
const QueEsNatillerapp = () => import('../views/auth/QueEsNatillerapp.vue')
const Dashboard = () => import('../views/Dashboard.vue')
const NatilleraDetalle = () => import('../views/natilleras/NatilleraDetalle.vue')
const NatilleraCierre = () => import('../views/natilleras/NatilleraCierre.vue')
const NatilleraCrear = () => import('../views/natilleras/NatilleraCrear.vue')
const Socios = () => import('../views/socios/Socios.vue')
const Cuotas = () => import('../views/cuotas/Cuotas.vue')
const Prestamos = () => import('../views/prestamos/Prestamos.vue')
const Actividades = () => import('../views/actividades/Actividades.vue')
const CuadreCaja = () => import('../views/cuadre/CuadreCaja.vue')
const NatilleraConfiguracion = () => import('../views/natilleras/NatilleraConfiguracion.vue')
const Configuracion = () => import('../views/configuracion/Configuracion.vue')
const Auditoria = () => import('../views/auditoria/Auditoria.vue')
const ChatAdmin = () => import('../views/admin/ChatAdmin.vue')
const DataAdmin = () => import('../views/admin/DataAdmin.vue')
const AceptarInvitacion = () => import('../views/invitaciones/AceptarInvitacion.vue')

// Helper para detectar si estamos en modo desarrollo
const isDevMode = isDev || isLocalhost

// Rutas base de la aplicación
const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/auth',
    component: AuthLayout,
    children: [
      {
        path: 'login',
        name: 'Login',
        component: Login,
        meta: { title: 'Iniciar Sesión' }
      },
      {
        path: 'register',
        name: 'Register',
        component: Register,
        meta: { title: 'Registrarse' }
      },
      {
        path: 'welcome',
        name: 'Welcome',
        component: Welcome,
        meta: { title: 'Bienvenido' }
      },
      {
        path: 'reset-password',
        name: 'ResetPassword',
        component: ResetPassword,
        meta: { title: 'Restablecer Contraseña' }
      },
      {
        path: 'que-es-natillerapp',
        name: 'QueEsNatillerapp',
        component: QueEsNatillerapp,
        meta: { title: 'Qué es Natillerapp' }
      }
    ]
  },
  {
    path: '/',
    component: DashboardLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: Dashboard,
        meta: { title: 'Dashboard' }
      },
      {
        // Redirección para compatibilidad con links existentes
        path: 'natilleras',
        redirect: '/dashboard'
      },
      {
        path: 'natilleras/crear',
        name: 'NatilleraCrear',
        component: NatilleraCrear,
        meta: { title: 'Crear Natillera' }
      },
      {
        path: 'natilleras/:id/cierre',
        name: 'NatilleraCierre',
        component: NatilleraCierre,
        props: true,
        meta: { title: 'Cierre de Natillera' }
      },
      // Rutas con más segmentos antes que `natilleras/:id` para un emparejado inequívoco
      {
        path: 'natilleras/:id/socios',
        name: 'Socios',
        component: Socios,
        props: true,
        meta: { title: 'Socios' }
      },
      {
        path: 'natilleras/:id/cuotas',
        name: 'CuotasDefault',
        component: Cuotas,
        props: true,
        meta: { title: 'Cuotas' }
      },
      {
        path: 'natilleras/:id/cuotas/:mes',
        name: 'Cuotas',
        component: Cuotas,
        props: true,
        meta: { title: 'Cuotas' }
      },
      {
        path: 'natilleras/:id/prestamos',
        name: 'Prestamos',
        component: Prestamos,
        props: true,
        meta: { title: 'Préstamos' }
      },
      {
        path: 'natilleras/:id/actividades',
        name: 'Actividades',
        component: Actividades,
        props: true,
        meta: { title: 'Actividades' }
      },
      {
        path: 'natilleras/:id/cuadre-caja',
        name: 'CuadreCaja',
        component: CuadreCaja,
        props: true,
        meta: { title: 'Totales generales' }
      },
      {
        path: 'natilleras/:id/configuracion',
        name: 'NatilleraConfiguracion',
        component: NatilleraConfiguracion,
        props: true,
        meta: { title: 'Configuración Natillera' }
      },
      {
        path: 'natilleras/:id',
        name: 'NatilleraDetalle',
        component: NatilleraDetalle,
        props: true,
        meta: { title: 'Detalle Natillera' }
      },
      {
        path: 'configuracion',
        name: 'Configuracion',
        component: Configuracion,
        meta: { title: 'Configuración' }
      },
      {
        path: 'auditoria',
        name: 'Auditoria',
        component: Auditoria,
        meta: { title: 'Auditoría' }
      },
      {
        path: 'admin/chat',
        name: 'ChatAdmin',
        component: ChatAdmin,
        meta: { title: 'Chat Admin' }
      },
      {
        path: 'admin/data',
        name: 'DataAdmin',
        component: DataAdmin,
        meta: { title: 'Data Admin' }
      },
      {
        path: 'invitacion/:token',
        name: 'AceptarInvitacion',
        component: AceptarInvitacion,
        props: true,
        meta: { title: 'Aceptar Invitación' }
      },
      // Rutas experimentales (solo en desarrollo)
      // Añade aquí rutas que quieras probar antes de llevarlas a producción
      // Ejemplo:
      // ...(isDevMode ? [{
      //   path: 'experimental/nueva-vista',
      //   name: 'NuevaVistaExperimental',
      //   component: () => import('../views/experimental/NuevaVista.vue'),
      //   meta: { devOnly: true }
      // }] : [])
    ]
  }
]

// Rutas experimentales que solo están disponibles en desarrollo
const experimentalRoutes = [
  // Añade aquí rutas experimentales
  // {
  //   path: '/dev/playground',
  //   name: 'DevPlayground',
  //   component: () => import('../views/dev/Playground.vue'),
  //   meta: { devOnly: true, requiresAuth: true }
  // }
]

// Agregar rutas experimentales solo en desarrollo
if (isDevMode) {
  devLog('Modo desarrollo activo - Rutas experimentales habilitadas')
  routes.push(...experimentalRoutes)
}

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Guard de navegación
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  const params = to.params || {}
  const hasInvalidParams = Object.keys(params).some(key => {
    const value = params[key]
    return value === undefined || value === null || value === 'undefined' || value === 'null' || value === ''
  })
  
  if (hasInvalidParams) {
    console.warn('Parámetros de ruta inválidos detectados, redirigiendo al dashboard', params)
    next({ name: 'Dashboard' })
    return
  }
  
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!authStore.isAuthenticated) {
      // Esperar a que onAuthStateChange resuelva la sesión inicial (sin round-trip extra).
      // Timeout de seguridad: si INITIAL_SESSION no llega en 3s, asumir no autenticado.
      if (!authStore.initialSessionResolved) {
        await Promise.race([
          authStore.initialSessionReady,
          new Promise(resolve => setTimeout(resolve, 3000))
        ])
      }
      
      if (!authStore.isAuthenticated) {
        next({ name: 'Login' })
        return
      }
    }
  }
  
  if (to.name === 'Login' || to.name === 'Register' || to.name === 'Welcome') {
    // Esperar hidratación antes de redirigir (evita flash al login cuando hay sesión válida)
    if (!authStore.initialSessionResolved) {
      await Promise.race([
        authStore.initialSessionReady,
        new Promise(resolve => setTimeout(resolve, 3000))
      ])
    }
    if (authStore.isAuthenticated && !authStore.loginEnCurso) {
      const loc = await resolvePostLoginLocation(authStore.user)
      next(loc)
      return
    }
  }
  
  next()
})

// Guard para hacer scroll al inicio en cada navegación (excepto NatilleraDetalle que tiene su lógica especial)
router.afterEach((to, from) => {
  // Actualizar el título de la página
  const title = to.matched.find(record => record.meta.title)?.meta.title
  if (title) {
    document.title = `${title} | Natillerapp`
  } else {
    document.title = 'Natillerapp'
  }

  const authStore = useAuthStore()
  const uid = authStore.user?.id
  const rawId = to.params?.id
  const idParam = Array.isArray(rawId) ? rawId[0] : rawId
  if (uid && idParam && idParam !== 'undefined' && idParam !== 'null' && idParam !== '') {
    if (to.path.startsWith(`/natilleras/${idParam}`)) {
      setLastNatilleraId(uid, String(idParam))
    }
  }

  // No hacer scroll si es la misma ruta (solo cambio de query params)
  if (to.path === from.path) {
    return
  }

  // No hacer scroll en NatilleraDetalle (tiene su lógica especial para scroll a socios en mora)
  if (to.name === 'NatilleraDetalle') {
    return
  }

  // Hacer scroll al inicio: en DashboardLayout el scroll vive en <main>, no en window
  const dashboardMain = document.querySelector('main.overflow-y-auto')
  if (dashboardMain) {
    dashboardMain.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: 'instant' // Usar 'instant' para evitar animaciones raras
  })
})

export default router


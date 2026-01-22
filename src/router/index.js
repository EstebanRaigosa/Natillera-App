import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { isDev, isLocalhost, devLog } from '../config/environment'

// Layouts
import AuthLayout from '../layouts/AuthLayout.vue'
import DashboardLayout from '../layouts/DashboardLayout.vue'

// Views
import Login from '../views/auth/Login.vue'
import Register from '../views/auth/Register.vue'
import Welcome from '../views/auth/Welcome.vue'
import ResetPassword from '../views/auth/ResetPassword.vue'
import Dashboard from '../views/Dashboard.vue'
import NatilleraDetalle from '../views/natilleras/NatilleraDetalle.vue'
import NatilleraCrear from '../views/natilleras/NatilleraCrear.vue'
import Socios from '../views/socios/Socios.vue'
import Cuotas from '../views/cuotas/Cuotas.vue'
import CuotasMeses from '../views/cuotas/CuotasMeses.vue'
import Prestamos from '../views/prestamos/Prestamos.vue'
import Actividades from '../views/actividades/Actividades.vue'
import NatilleraConfiguracion from '../views/natilleras/NatilleraConfiguracion.vue'
import Configuracion from '../views/configuracion/Configuracion.vue'
import Auditoria from '../views/auditoria/Auditoria.vue'
import ChatAdmin from '../views/admin/ChatAdmin.vue'
import DataAdmin from '../views/admin/DataAdmin.vue'
import AceptarInvitacion from '../views/invitaciones/AceptarInvitacion.vue'

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
        path: 'natilleras/:id',
        name: 'NatilleraDetalle',
        component: NatilleraDetalle,
        props: true,
        meta: { title: 'Detalle Natillera' }
      },
      {
        path: 'natilleras/:id/socios',
        name: 'Socios',
        component: Socios,
        props: true,
        meta: { title: 'Socios' }
      },
      {
        path: 'natilleras/:id/cuotas',
        name: 'CuotasMeses',
        component: CuotasMeses,
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
        path: 'natilleras/:id/configuracion',
        name: 'NatilleraConfiguracion',
        component: NatilleraConfiguracion,
        props: true,
        meta: { title: 'Configuración Natillera' }
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
  
  // Validar parámetros de ruta para evitar URLs con "undefined"
  // Verificar si hay parámetros inválidos (undefined, null, o string "undefined")
  const params = to.params || {}
  const hasInvalidParams = Object.keys(params).some(key => {
    const value = params[key]
    return value === undefined || value === null || value === 'undefined' || value === 'null' || value === ''
  })
  
  if (hasInvalidParams) {
    // Si hay parámetros inválidos, redirigir al dashboard
    console.warn('Parámetros de ruta inválidos detectados, redirigiendo al dashboard', params)
    next({ name: 'Dashboard' })
    return
  }
  
  // Verificar si la ruta requiere autenticación
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!authStore.isAuthenticated) {
      // Intentar recuperar sesión
      await authStore.checkAuth()
      
      if (!authStore.isAuthenticated) {
        next({ name: 'Login' })
        return
      }
    }
  }
  
  // Si ya está autenticado y va a login/register/welcome, redirigir al dashboard
  // ResetPassword es una excepción ya que puede estar autenticado temporalmente con token de recuperación
  if (to.name === 'Login' || to.name === 'Register' || to.name === 'Welcome') {
    if (authStore.isAuthenticated) {
      next({ name: 'Dashboard' })
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

  // No hacer scroll si es la misma ruta (solo cambio de query params)
  if (to.path === from.path) {
    return
  }

  // No hacer scroll en NatilleraDetalle (tiene su lógica especial para scroll a socios en mora)
  if (to.name === 'NatilleraDetalle') {
    return
  }

  // Hacer scroll al inicio para todas las demás rutas
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: 'instant' // Usar 'instant' para evitar animaciones raras
  })
})

export default router


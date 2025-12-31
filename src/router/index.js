import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

// Layouts
import AuthLayout from '../layouts/AuthLayout.vue'
import DashboardLayout from '../layouts/DashboardLayout.vue'

// Views
import Login from '../views/auth/Login.vue'
import Register from '../views/auth/Register.vue'
import Dashboard from '../views/Dashboard.vue'
import Natilleras from '../views/natilleras/Natilleras.vue'
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
        component: Login
      },
      {
        path: 'register',
        name: 'Register',
        component: Register
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
        component: Dashboard
      },
      {
        path: 'natilleras',
        name: 'Natilleras',
        component: Natilleras
      },
      {
        path: 'natilleras/crear',
        name: 'NatilleraCrear',
        component: NatilleraCrear
      },
      {
        path: 'natilleras/:id',
        name: 'NatilleraDetalle',
        component: NatilleraDetalle,
        props: true
      },
      {
        path: 'natilleras/:id/socios',
        name: 'Socios',
        component: Socios,
        props: true
      },
      {
        path: 'natilleras/:id/cuotas',
        name: 'CuotasMeses',
        component: CuotasMeses,
        props: true
      },
      {
        path: 'natilleras/:id/cuotas/:mes',
        name: 'Cuotas',
        component: Cuotas,
        props: true
      },
      {
        path: 'natilleras/:id/prestamos',
        name: 'Prestamos',
        component: Prestamos,
        props: true
      },
      {
        path: 'natilleras/:id/actividades',
        name: 'Actividades',
        component: Actividades,
        props: true
      },
      {
        path: 'natilleras/:id/configuracion',
        name: 'NatilleraConfiguracion',
        component: NatilleraConfiguracion,
        props: true
      },
      {
        path: 'configuracion',
        name: 'Configuracion',
        component: Configuracion
      },
      {
        path: 'auditoria',
        name: 'Auditoria',
        component: Auditoria
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Guard de navegación
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
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
  
  // Si ya está autenticado y va a login/register, redirigir al dashboard
  if (to.name === 'Login' || to.name === 'Register') {
    if (authStore.isAuthenticated) {
      next({ name: 'Dashboard' })
      return
    }
  }
  
  next()
})

// Guard para hacer scroll al inicio en cada navegación (excepto NatilleraDetalle que tiene su lógica especial)
router.afterEach((to, from) => {
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


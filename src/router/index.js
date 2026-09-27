import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { isDev, isLocalhost, devLog } from '../config/environment'
import { resolvePostLoginLocation, guardarDestinoPendiente } from '../utils/postLoginRoute'
import { setLastNatilleraId } from '../utils/lastNatillera'
import { aplicarSeoRuta } from '../utils/seoRuta'
import { esModoStandalone } from '../composables/usePwaInstall'
import { MODULO_DE_RUTA, MODULOS } from '../permisos/modulos'
import { SEO_PAGINAS } from '../views/publico/contenidoPublico'

// Layouts: AuthLayout estático (login y guía, primer paint sin sesión)
import AuthLayout from '../layouts/AuthLayout.vue'

// Auth views: estáticas (primer paint)
import Login from '../views/auth/Login.vue'
// Portada pública: estática porque es lo primero que pinta quien llega sin sesión, y su
// HTML ya viene pre-renderizado en el build (el chunk no debe hacerlo esperar).
import Landing from '../views/publico/Landing.vue'

/*
 * El layout de la app, diferido: arrastraba al arranque los tours (driver.js), la barra
 * de navegación y el soporte, y todo eso lo descargaba también quien solo mira la portada
 * pública. Con sesión, el service worker lo tiene precacheado y carga igual de rápido.
 */
const DashboardLayout = () => import('../layouts/DashboardLayout.vue')

// Todas las demás vistas: carga diferida para reducir bundle inicial
const Register = () => import('../views/auth/Register.vue')
const Welcome = () => import('../views/auth/Welcome.vue')
const ResetPassword = () => import('../views/auth/ResetPassword.vue')
const GuiaNatillera = () => import('../views/publico/GuiaNatillera.vue')
const Dashboard = () => import('../views/Dashboard.vue')
const NatilleraDetalle = () => import('../views/natilleras/NatilleraDetalle.vue')
const NatilleraCierre = () => import('../views/natilleras/NatilleraCierre.vue')
const NatilleraCrear = () => import('../views/natilleras/NatilleraCrear.vue')
const Socios = () => import('../views/socios/Socios.vue')
const Cuotas = () => import('../views/cuotas/Cuotas.vue')
const Prestamos = () => import('../views/prestamos/Prestamos.vue')
const Actividades = () => import('../views/actividades/Actividades.vue')
const CuadreCaja = () => import('../views/cuadre/CuadreCaja.vue')
const ConciliacionCaja = () => import('../views/conciliacion/ConciliacionCaja.vue')
const Movimientos = () => import('../views/movimientos/Movimientos.vue')
const PagosSocios = () => import('../views/pagos/PagosSocios.vue')
const NotificarSocios = () => import('../views/notificar/NotificarSocios.vue')
const NatilleraConfiguracion = () => import('../views/natilleras/NatilleraConfiguracion.vue')
const Configuracion = () => import('../views/configuracion/Configuracion.vue')
const MiCuenta = () => import('../views/usuario/MiCuenta.vue')
const Auditoria = () => import('../views/auditoria/Auditoria.vue')
const DataAdmin = () => import('../views/admin/DataAdmin.vue')
const AceptarInvitacion = () => import('../views/invitaciones/AceptarInvitacion.vue')
const DesignSystemDemo = () => import('../views/demo/DesignSystemDemo.vue')
// Soporte: carga diferida para que el módulo no engorde el arranque (RNF-12)
const Soporte = () => import('../views/soporte/Soporte.vue')
const SoporteAdmin = () => import('../views/admin/SoporteAdmin.vue')
const TraficoAdmin = () => import('../views/admin/TraficoAdmin.vue')
const UnirmeNatillera = () => import('../views/invitaciones/UnirmeNatillera.vue')
const PortalSocio = () => import('../views/portal/PortalSocio.vue')
const SociosEnApp = () => import('../views/socios/SociosEnApp.vue')
const PaginaLegal = () => import('../views/legal/PaginaLegal.vue')
const AdministradoresNatillera = () => import('../views/natilleras/AdministradoresNatillera.vue')
const PaginaNoEncontrada = () => import('../views/publico/PaginaNoEncontrada.vue')

// Helper para detectar si estamos en modo desarrollo
const isDevMode = isDev || isLocalhost

// Rutas base de la aplicación
const routes = [
  {
    /*
     * Portada pública. Con sesión no se muestra: se va directo a la última natillera,
     * como antes hacía el redirect a /dashboard. Sin sesión es la página que indexa
     * Google, y viene pre-renderizada en el build.
     */
    path: '/',
    name: 'Inicio',
    component: Landing,
    meta: {
      publico: true,
      tituloCompleto: SEO_PAGINAS['/'].titulo,
      descripcion: SEO_PAGINAS['/'].descripcion
    },
    async beforeEnter() {
      const authStore = useAuthStore()
      if (!authStore.initialSessionResolved) {
        await Promise.race([
          authStore.initialSessionReady,
          new Promise(resolve => setTimeout(resolve, 3000))
        ])
      }
      if (authStore.isAuthenticated) return resolvePostLoginLocation(authStore.user)
      // La PWA instalada no es para conocer la app sino para usarla: sin sesión, al login.
      // Cubre también las instaladas con el start_url viejo («/»), que iOS congela al instalar.
      if (esModoStandalone()) return { name: 'Login' }
      return true
    }
  },
  {
    /*
     * Enlace que el admin comparte en el grupo de WhatsApp para que cada socio vincule su
     * cuenta. Público (se abre sin sesión: saluda y pide iniciarla) y sin `meta.publico`,
     * para que no lo indexe Google.
     */
    path: '/unirme/:codigo',
    name: 'UnirmeNatillera',
    component: UnirmeNatillera,
    props: true,
    meta: { title: 'Unirme a mi natillera' }
  },
  {
    // Documentos legales: públicos (se leen antes de crear la cuenta) e indexables.
    path: '/privacidad',
    name: 'PoliticaDatos',
    component: PaginaLegal,
    meta: {
      publico: true,
      tituloCompleto: SEO_PAGINAS['/privacidad'].titulo,
      descripcion: SEO_PAGINAS['/privacidad'].descripcion
    }
  },
  {
    path: '/terminos',
    name: 'Terminos',
    component: PaginaLegal,
    meta: {
      publico: true,
      tituloCompleto: SEO_PAGINAS['/terminos'].titulo,
      descripcion: SEO_PAGINAS['/terminos'].descripcion
    }
  },
  {
    /*
     * Guía «Qué es una natillera»: la página con más texto del sitio, la que compite por
     * las búsquedas de quien quiere armar una. Página propia con el estilo de la portada.
     */
    path: '/que-es-una-natillera',
    name: 'QueEsNatillerapp',
    component: GuiaNatillera,
    meta: {
      publico: true,
      tituloCompleto: SEO_PAGINAS['/que-es-una-natillera'].titulo,
      descripcion: SEO_PAGINAS['/que-es-una-natillera'].descripcion
    }
  },
  // Dirección anterior de la guía: los enlaces viejos siguen funcionando (en Netlify es un 301).
  { path: '/auth/que-es-natillerapp', redirect: '/que-es-una-natillera' },
  // La portada también existe como archivo; que no se abra como página vacía.
  { path: '/index.html', redirect: '/' },
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
        // Dueño, co-administradores, colaboradores y visores: invitar, permisos y accesos
        path: 'natilleras/:id/administradores',
        name: 'AdministradoresNatillera',
        component: AdministradoresNatillera,
        props: true,
        meta: { title: 'Administradores' }
      },
      {
        // Invitar, aprobar y administrar las cuentas con que los socios entran a la app
        path: 'natilleras/:id/socios-en-la-app',
        name: 'SociosEnApp',
        component: SociosEnApp,
        props: true,
        meta: { title: 'Invitar socios' }
      },
      {
        path: 'natilleras/:id/cuotas/:mes?',
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
        path: 'natilleras/:id/conciliacion',
        name: 'ConciliacionCaja',
        component: ConciliacionCaja,
        props: true,
        meta: { title: 'Conciliación de caja' }
      },
      {
        // Portal del socio (solo lectura). La base de datos solo responde si esta cuenta
        // está vinculada a ese socio: no hace falta más guardia aquí.
        path: 'mi-natillera/:socioNatilleraId',
        name: 'PortalSocio',
        component: PortalSocio,
        meta: { title: 'Mi natillera' }
      },
      {
        path: 'natilleras/:id/notificar',
        name: 'NotificarSocios',
        component: NotificarSocios,
        props: true,
        meta: { title: 'Notificar' }
      },
      {
        path: 'natilleras/:id/pagos',
        name: 'PagosSocios',
        component: PagosSocios,
        props: true,
        meta: { title: 'Pagos de los socios' }
      },
      {
        path: 'natilleras/:id/movimientos',
        name: 'Movimientos',
        component: Movimientos,
        props: true,
        meta: { title: 'Movimientos del fondo' }
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
        // Preferencias de la persona, no de la natillera: avisos push y botón
        // de soporte. `/configuracion` guarda los ajustes compartidos.
        path: 'mi-cuenta',
        name: 'MiCuenta',
        component: MiCuenta,
        meta: { title: 'Mi cuenta' }
      },
      {
        path: 'auditoria',
        name: 'Auditoria',
        component: Auditoria,
        meta: { title: 'Auditoría' }
      },
      {
        path: 'admin/data',
        name: 'DataAdmin',
        component: DataAdmin,
        meta: { title: 'Data Admin' }
      },
      // ── Soporte ──────────────────────────────────────────────────────────
      {
        path: 'soporte/:conversacionId?',
        name: 'Soporte',
        component: Soporte,
        // Sin `props: true`: la vista lee el parámetro con useRoute y así puede
        // reaccionar a que la ruta cambie sin remontarse.
        meta: { title: 'Soporte' }
      },
      {
        // Mismo criterio que el panel de soporte: el guard evita el paseo inútil, pero
        // quien manda es RLS — `accesos_usuario` solo abre el tráfico ajeno al superadmin.
        path: 'admin/trafico',
        name: 'TraficoAdmin',
        component: TraficoAdmin,
        meta: { title: 'Tráfico', requiresSuperAdmin: true }
      },
      {
        // El guard es comodidad de interfaz: aunque alguien fuerce la ruta,
        // RLS no le devuelve ninguna fila (RF-16, CA-14).
        path: 'admin/soporte/:conversacionId?',
        name: 'SoporteAdmin',
        component: SoporteAdmin,
        meta: { title: 'Panel de soporte', requiresSuperAdmin: true }
      },
      {
        path: 'invitacion/:token',
        name: 'AceptarInvitacion',
        component: AceptarInvitacion,
        props: true,
        meta: { title: 'Aceptar Invitación' }
      },
      {
        // Demo del sistema de diseño (DS) — accesible solo dentro del dashboard
        path: 'ds-demo',
        name: 'DesignSystemDemo',
        component: DesignSystemDemo,
        meta: { title: 'Sistema de Diseño · Demo' }
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
  },
  {
    /*
     * Cualquier dirección que no existe. Antes pintaba una página vacía, y para Google
     * era un «soft 404»: una página en blanco que respondía como si existiera. Sin
     * `meta.publico`, así que va con noindex.
     */
    path: '/:pathMatch(.*)*',
    name: 'PaginaNoEncontrada',
    component: PaginaNoEncontrada,
    meta: { title: 'Página no encontrada' }
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

  // Validar parámetros de ruta para evitar URLs con el string literal "undefined"/"null".
  // Params opcionales ausentes llegan como undefined/null reales y son válidos.
  const params = to.params || {}
  const hasInvalidParams = Object.keys(params).some(key => {
    const value = params[key]
    return value === 'undefined' || value === 'null'
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
      // Esperar a que onAuthStateChange resuelva la sesión inicial (sin round-trip extra).
      // Timeout de seguridad: si INITIAL_SESSION no llega en 3s, asumir no autenticado.
      if (!authStore.initialSessionResolved) {
        await Promise.race([
          authStore.initialSessionReady,
          new Promise(resolve => setTimeout(resolve, 3000))
        ])
      }

      if (!authStore.isAuthenticated) {
        // Recordar a dónde iba: tras iniciar sesión se vuelve ahí (invitaciones, enlaces).
        guardarDestinoPendiente(to.fullPath)
        next({ name: 'Login' })
        return
      }
    }
  }

  // Permisos por opción de la natillera: en «Nada» la ruta no se abre (antes cualquiera con
  // el enlace entraba a cualquier pantalla). La base de datos igual protege los datos; esto
  // evita pantallas vacías o a medio cargar. Si no se pudo preguntar, se deja pasar.
  const moduloRuta = MODULO_DE_RUTA[to.name]
  if (moduloRuta && to.params.id && authStore.isAuthenticated) {
    try {
      const { cargarNivelesNatillera, alcanza } = await import('../composables/usePermisosNatillera')
      const { niveles } = await cargarNivelesNatillera(String(to.params.id))
      if (!alcanza(niveles?.[moduloRuta], 'ver')) {
        const { useNotificationStore } = await import('../stores/notifications')
        const modulo = MODULOS.find(m => m.clave === moduloRuta)
        useNotificationStore().warning(`No tienes acceso a ${modulo?.nombre || 'esa opción'} en esta natillera.`, 'Sin permiso')
        next(from.name ? false : { name: 'NatilleraDetalle', params: { id: to.params.id } })
        return
      }
    } catch (e) {
      console.warn('No se pudieron comprobar los permisos de la ruta:', e)
    }
  }

  // Panel de soporte: solo superadministrador (RF-16). La autoridad se resuelve
  // en la base de datos con es_super_admin(), nunca comparando un correo aquí.
  if (to.matched.some(record => record.meta.requiresSuperAdmin)) {
    const { useSoporteStore } = await import('../stores/soporte')
    const soporteStore = useSoporteStore()
    // Forzado: entrar al panel es justo el momento de preguntar de nuevo, no de
    // fiarse de una respuesta cacheada de antes de que cambiara el rol.
    const autorizado = await soporteStore.comprobarRol({ forzar: true })
    if (!autorizado) {
      next({ name: 'Dashboard' })
      return
    }
  }

  // Si ya está autenticado y va a login/register/welcome, ir al detalle de la última natillera o al dashboard
  // ResetPassword es una excepción ya que puede estar autenticado temporalmente con token de recuperación
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
  // Título, descripción, canonical y robots de la ruta (utils/seoRuta.js)
  aplicarSeoRuta(to)

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

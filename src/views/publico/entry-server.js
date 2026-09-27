/*
 * Entrada de servidor para pre-renderizar las páginas públicas en el build (ver
 * scripts/prerender-publico.mjs). No se usa en el navegador.
 *
 * Un router en memoria con solo las rutas públicas, con los mismos componentes (y los
 * mismos nombres de ruta, que usan sus <RouterLink>) que el router de la app. El comodín
 * vacío resuelve el resto de enlaces (/auth/login, …) a su href.
 */
import { createSSRApp, h } from 'vue'
import { createRouter, createMemoryHistory, RouterView } from 'vue-router'
import { renderToString } from 'vue/server-renderer'
import Landing from './Landing.vue'
import AuthLayout from '../../layouts/AuthLayout.vue'
import QueEsNatillerapp from '../auth/QueEsNatillerapp.vue'
import PaginaLegal from '../legal/PaginaLegal.vue'

export { faqJsonLd, SEO_PAGINAS, URL_SITIO } from './contenidoPublico'

const vacio = { render: () => null }

export async function render(url = '/') {
  const app = createSSRApp({ render: () => h(RouterView) })
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: Landing },
      { path: '/que-es-una-natillera', component: AuthLayout, children: [{ path: '', name: 'QueEsNatillerapp', component: QueEsNatillerapp }] },
      { path: '/privacidad', name: 'PoliticaDatos', component: PaginaLegal },
      { path: '/terminos', name: 'Terminos', component: PaginaLegal },
      { path: '/auth/login', name: 'Login', component: vacio },
      { path: '/:resto(.*)*', component: vacio }
    ]
  })
  app.use(router)
  await router.push(url)
  await router.isReady()
  return renderToString(app)
}

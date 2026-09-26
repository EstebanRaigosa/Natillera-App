/*
 * Entrada de servidor para pre-renderizar la portada en el build (ver
 * scripts/prerender-publico.mjs). No se usa en el navegador.
 *
 * La portada usa <RouterLink>, así que necesita un router: uno en memoria con la ruta «/»
 * y un comodín vacío para que los enlaces (/auth/login, …) se resuelvan a su href.
 */
import { createSSRApp } from 'vue'
import { createRouter, createMemoryHistory } from 'vue-router'
import { renderToString } from 'vue/server-renderer'
import Landing from './Landing.vue'

export { faqJsonLd } from './contenidoPublico'

export async function render(url = '/') {
  const app = createSSRApp(Landing)
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: Landing },
      { path: '/:resto(.*)*', component: { render: () => null } }
    ]
  })
  app.use(router)
  await router.push(url)
  await router.isReady()
  return renderToString(app)
}

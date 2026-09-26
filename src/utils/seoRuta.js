/*
 * Metadatos por ruta para buscadores y redes. La app es una SPA: el HTML trae los de la
 * portada, y aquí se ajustan en cada navegación. Google ejecuta el JavaScript y respeta
 * lo que se pone así (título, descripción, canonical y `robots`).
 *
 * Regla: solo las rutas con `meta.publico` se indexan. Todo lo demás —login, registro y
 * la app entera— va con `noindex`: no aporta nada en un buscador y no debe competir con
 * la portada.
 */
import { URL_SITIO } from '../views/publico/contenidoPublico'

const DESCRIPCION_POR_DEFECTO =
  'App gratuita para gestionar tu natillera: cuotas, multas, préstamos, rifas, caja y cierre, en el celular o la computadora.'

function meta(selector, crear) {
  let el = document.head.querySelector(selector)
  if (!el && crear) {
    el = document.createElement(crear.tag)
    Object.entries(crear.attrs).forEach(([k, v]) => el.setAttribute(k, v))
    document.head.appendChild(el)
  }
  return el
}

function fijar(selector, crear, atributo, valor) {
  const el = meta(selector, crear)
  if (el) el.setAttribute(atributo, valor)
}

export function aplicarSeoRuta(to) {
  if (typeof document === 'undefined') return
  const registro = [...to.matched].reverse()
  const tituloCompleto = registro.find(r => r.meta.tituloCompleto)?.meta.tituloCompleto
  const titulo = registro.find(r => r.meta.title)?.meta.title
  const descripcion = registro.find(r => r.meta.descripcion)?.meta.descripcion || DESCRIPCION_POR_DEFECTO
  const publico = to.matched.some(r => r.meta.publico)

  document.title = tituloCompleto || (titulo ? `${titulo} | Natillerapp` : 'Natillerapp')

  fijar('meta[name="description"]', { tag: 'meta', attrs: { name: 'description' } }, 'content', descripcion)
  fijar('meta[name="robots"]', { tag: 'meta', attrs: { name: 'robots' } }, 'content', publico ? 'index, follow' : 'noindex, nofollow')

  // Canonical y og:url solo en páginas públicas, y apuntando a sí mismas: antes todas
  // declaraban la portada como canónica y Google trataba las demás como copias.
  const canonical = document.head.querySelector('link[rel="canonical"]')
  const ogUrl = document.head.querySelector('meta[property="og:url"]')
  if (publico) {
    const url = URL_SITIO + (to.path === '/' ? '/' : to.path)
    fijar('link[rel="canonical"]', { tag: 'link', attrs: { rel: 'canonical' } }, 'href', url)
    fijar('meta[property="og:url"]', { tag: 'meta', attrs: { property: 'og:url' } }, 'content', url)
    fijar('meta[property="og:title"]', { tag: 'meta', attrs: { property: 'og:title' } }, 'content', document.title)
    fijar('meta[property="og:description"]', { tag: 'meta', attrs: { property: 'og:description' } }, 'content', descripcion)
  } else {
    canonical?.remove()
    ogUrl?.remove()
  }
}

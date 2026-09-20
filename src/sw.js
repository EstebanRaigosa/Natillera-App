/**
 * Service worker de Natillerapp — precache de la PWA + notificaciones push.
 *
 * Hasta ahora `vite-plugin-pwa` generaba este archivo solo (`generateSW`). El
 * chat de soporte necesita manejadores propios de `push` y `notificationclick`,
 * que solo pueden vivir en un service worker escrito a mano, así que el plugin
 * pasa a modo `injectManifest` (RNF-06) y este archivo conserva exactamente el
 * comportamiento de precache anterior:
 *
 *   · precache del shell (JS/CSS/HTML) para que al volver a la app desde una
 *     pestaña descartada arranque desde cache y no en blanco,
 *   · navegaciones offline al shell (`index.html`),
 *   · nunca interceptar peticiones a Supabase ni a los proxies de API,
 *   · limpieza de caches antiguas y activación inmediata.
 *
 * Cualquier cambio aquí afecta a TODOS los usuarios de la PWA, no solo al
 * soporte: un error deja la app sin arrancar hasta que el navegador reemplace
 * el service worker.
 */

import { precacheAndRoute, cleanupOutdatedCaches, createHandlerBoundToURL } from 'workbox-precaching'
import { NavigationRoute, registerRoute } from 'workbox-routing'
import { clientsClaim } from 'workbox-core'

/*
 * Activación: `clientsClaim` sí, `skipWaiting` automático NO.
 *
 * Antes esto era `self.skipWaiting()` a secas, y era peligroso: el service
 * worker nuevo tomaba el control de una pestaña que ya estaba pintada con el
 * index.html viejo. Esa página sigue pidiendo sus chunks con hash viejo —todas
 * las vistas se cargan con `import()`— y `cleanupOutdatedCaches` acababa de
 * borrarlos, así que navegar a Cuotas o Préstamos podía fallar con «Failed to
 * fetch dynamically imported module». Y encima no arreglaba nada: sin recargar,
 * el usuario seguía viendo la versión anterior.
 *
 * Ahora el relevo lo pide la app (`useActualizacionApp`) justo antes de
 * recargar, mandando SKIP_WAITING. Así las dos versiones nunca conviven en una
 * misma página.
 */
clientsClaim()

self.addEventListener('message', (event) => {
  // El mensaje lo envía workbox-window desde `useActualizacionApp`.
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting()
})

// Lista de archivos del build, inyectada por vite-plugin-pwa al compilar.
precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()

// SPA: una navegación sin red cae al shell. La denylist reproduce
// `navigateFallbackDenylist`: ni Supabase ni los proxies de API deben acabar
// devolviendo el HTML de la aplicación.
registerRoute(new NavigationRoute(createHandlerBoundToURL('/index.html'), {
  denylist: [/^\/api-/, /supabase\.co/, /^\/sw\.js$/, /^\/manifest\.webmanifest$/],
}))

// ---------------------------------------------------------------------------
// Notificaciones push del soporte (RF-10, RF-11)
// ---------------------------------------------------------------------------

/*
 * Dos imágenes con papeles distintos:
 *
 *   icon  — se ve a color, grande, en Android y en escritorio. Es el icono de la
 *           app, sin inventar nada: la notificación tiene que parecer de
 *           Natillerapp de un vistazo.
 *   badge — la silueta pequeña de la barra de estado en Android. Es una MÁSCARA:
 *           el sistema toma solo el canal alfa y lo pinta de blanco, así que un
 *           icono con fondo opaco sale como un cuadrado blanco. Lleva su propio
 *           PNG monocromo, que reproduce la marca —el aro de ocho socios
 *           alrededor de la moneda— en vez del globo de chat genérico que traía
 *           antes: en la barra de estado se distinguía de cualquier otro chat en
 *           nada. Se regenera con `npm run badge:notificacion`.
 *
 * iOS ignora las dos y usa siempre el icono de la PWA instalada; no hay forma de
 * cambiarlo por notificación.
 */
const ICONO = '/android-chrome-192x192.png'
const INSIGNIA = '/badge-notificacion.png'

self.addEventListener('push', (event) => {
  // Un push sin datos legibles no debe romper el manejador: si `showNotification`
  // no llega a llamarse, algunos navegadores muestran un aviso genérico propio.
  let datos = {}
  try {
    datos = event.data ? event.data.json() : {}
  } catch {
    datos = { titulo: 'Natillerapp', cuerpo: event.data ? event.data.text() : '' }
  }

  const titulo = datos.titulo || 'Natillerapp'
  const opciones = {
    body: datos.cuerpo || '',
    icon: ICONO,
    badge: INSIGNIA,
    // Varios mensajes de la misma conversación sustituyen la notificación
    // anterior en lugar de apilarse (RF-10).
    tag: datos.tag || 'natillerapp',
    renotify: Boolean(datos.tag),
    data: { url: datos.url || '/soporte', conversacionId: datos.conversacionId || null },
  }

  event.waitUntil(self.registration.showNotification(titulo, opciones))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const destino = event.notification.data?.url || '/soporte'

  event.waitUntil((async () => {
    const ventanas = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })

    // Si la app ya está abierta, se navega dentro de ella en lugar de abrir otra
    // pestaña: en móvil, dos instancias de la PWA confunden y duplican estado.
    for (const ventana of ventanas) {
      if ('focus' in ventana) {
        await ventana.focus()
        // La app escucha este mensaje y navega con vue-router (sin recargar).
        ventana.postMessage({ tipo: 'soporte-abrir', url: destino })
        return
      }
    }

    if (self.clients.openWindow) await self.clients.openWindow(destino)
  })())
})

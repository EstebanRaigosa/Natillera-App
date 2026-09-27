# SEO de Natillerapp: estado y próximos pasos

Actualizado el 2026-09-26.

## Cómo está montado

| Pieza | Dónde |
|---|---|
| Títulos y descripciones de las páginas públicas | `src/views/publico/contenidoPublico.js` (`SEO_PAGINAS`) |
| Pre-render de las páginas públicas (HTML + head por página) | `scripts/prerender-publico.mjs`, entrada `src/views/publico/entry-server.js` |
| Metadatos al navegar (título, canonical, `noindex` en lo privado) | `src/utils/seoRuta.js` |
| Rutas de Netlify para las páginas pre-renderizadas y el 301 de la guía vieja | `netlify.toml` |
| Datos estructurados: `WebApplication` y `Organization` | `index.html` |
| Datos estructurados: `FAQPage` (portada) y `Article` (guía) | los inyecta el pre-render |
| Imagen para compartir (1200×630) | `public/og-natillerapp.jpg`, se genera con `npm run og:imagen` |
| `robots.txt` y `sitemap.xml` | `public/` |

Páginas indexables: `/`, `/que-es-una-natillera`, `/privacidad`, `/terminos`. Todo lo demás
(login, la app, direcciones que no existen) sale del cascarón `app.html`, que lleva `noindex`
desde el HTML.

### Para añadir una página pública

1. La ruta en `src/router/index.js` con `meta.publico: true` y el título y la descripción en `SEO_PAGINAS`.
2. La ruta en `entry-server.js` y en `PAGINAS` de `prerender-publico.mjs`.
3. La regla en `netlify.toml` (antes del comodín; si no, cae en el cascarón con `noindex`).
4. La URL en `public/sitemap.xml`.

## Pendiente fuera del código

- **Google Search Console**: verificar el dominio (mejor por DNS), enviar `sitemap.xml` y pedir
  la indexación de `/` y `/que-es-una-natillera`. Lo mismo en Bing Webmaster Tools.
- **Perfiles en redes**: cuando existan, añadirlos como `sameAs` en el `Organization` de
  `index.html` y enlazar natillerapp.com desde ellos.
- **Enlaces entrantes**: blogs de finanzas personales, grupos y directorios de natilleras.
- **Marca**: hay competidores con nombres casi iguales (natillera.app, natillera.com). Usar
  siempre «Natillerapp» junto a «app para natilleras».
- **Política de datos**: el texto publicado en `/privacidad` aún tiene marcadores
  `[COMPLETAR: …]` (responsable, identificación). Es una página indexada: completarlos.

## Próximos pasos de contenido (el mayor impacto)

Hoy hay una sola guía. Lo que más busca la gente sobre natilleras son preguntas; cada una
puede ser una página: cómo hacer el reglamento de una natillera, cómo calcular los intereses
de los préstamos, cómo repartir las ganancias, ideas de actividades (rifas, bingos), cómo
llevar una natillera en Excel y por qué pasarse a una app.

## Rendimiento

Tras diferir `DashboardLayout` y sacar `driver.js` del arranque, la portada carga ~268 KB
gzip de JS y CSS (antes ~330 KB). Lo que más pesa ahora: el CSS global (~52 KB gzip) y
Supabase (~53 KB gzip, lo necesita el router para saber si hay sesión). Medir en
[PageSpeed Insights](https://pagespeed.web.dev/) tras cada despliegue grande.

# Próximos pasos para mejorar el posicionamiento en buscadores

Resumen de lo que ya está hecho y qué más puedes hacer para que Natillerapp aparezca mejor en búsquedas como "natillera", "aplicación natillera", "plataforma natillera".

---

## ✅ Ya implementado

- **index.html**: título y descripción con palabras clave, meta keywords, Open Graph, Twitter Card, canonical, JSON-LD (WebApplication), meta robots, preconnect a Supabase.
- **robots.txt** y **sitemap.xml** con URLs principales y lastmod.
- **AuthLayout**: subtítulo y pie con "plataforma", "aplicación", "natillera", "celular o computadora".

---

## 1. Imagen para redes sociales (rápido)

- Crea **`public/og-image.png`** de **1200×630 px** con el logo y el texto "Natillerapp – Plataforma para tu natillera".
- Así al compartir el enlace en Facebook, Twitter o WhatsApp se verá una vista previa atractiva.

---

## 2. Contenido público con palabras clave (medio impacto)

- Las páginas que más indexan Google son las **públicas**: login, registro, bienvenida.
- Ya tienen texto con "natillera", "plataforma", "aplicación" en el layout.
- Opción extra: una **página pública** tipo "Qué es Natillerapp" o "Cómo funciona" en `/como-funciona` o `/que-es-natillera` con 1–2 párrafos que repitan de forma natural: *natillera*, *plataforma*, *aplicación*, *ahorro colectivo*, *gestionar natillera*, *celular y computadora*. Eso da más contenido indexable y más oportunidades de rankear por esas búsquedas.

---

## 3. Velocidad y Core Web Vitals (medio impacto)

- **Preconnect** a Supabase ya está en el HTML; ayuda a que la primera petición al API sea más rápida.
- Revisa en [PageSpeed Insights](https://pagespeed.web.dev/) (móvil y escritorio) y corrige:
  - **LCP**: imágenes grandes con `width`/`height` o `loading="lazy"` donde aplique; evitar bloqueos del primer render.
  - **CLS**: reservar espacio para imágenes y evitar que el contenido salte al cargar.
- Si usas muchas imágenes en la app, comprímelas (WebP cuando sea posible) y usa tamaños adecuados.

---

## 4. Prerenderizado de rutas públicas (avanzado, alto impacto para SPAs)

- Ahora toda la app es una **SPA**: el HTML que recibe el buscador es el mismo para todas las URLs; el contenido por ruta se pinta con JavaScript.
- **Prerender** las rutas públicas (por ejemplo `/`, `/auth/login`, `/auth/register`) para que el crawler reciba HTML ya renderizado con títulos y texto.
- Opciones:
  - **Vite**: plugin tipo `vite-plugin-prerender` para generar HTML estático de esas rutas en el build.
  - **Netlify**: si usas Netlify, algún add-on o función de prerender para esas URLs.
- Con eso cada URL puede tener su propio título y descripción en el HTML inicial (si los inyectas en el prerender), lo que mejora el SEO por página.

---

## 5. Títulos y descripción por ruta (complemento al prerender)

- Si más adelante usas prerender o SSR, podrías tener **título y meta description distintos** por ruta (ej. "Iniciar sesión – Natillerapp", "Crear cuenta – Natillerapp").
- En una SPA pura, los meta tags por ruta se pueden cambiar con **@vueuse/head** o **unhead** (actualizando `document.title` y meta desde Vue); Google suele ejecutar JS y puede ver esos cambios, pero no todos los buscadores. El máximo beneficio viene si combinas esto con prerender o SSR.

---

## 6. Enlaces externos y autoridad (fuera del código)

- Que otras páginas enlacen a **https://natillerapp.com** (redes sociales, directorios, blogs, partners) ayuda al posicionamiento.
- Si tienes perfil en redes, pon el enlace a la app en la bio.
- Si existe algún directorio de "herramientas para natilleras" o "ahorro colectivo", intenta estar listado.

---

## 7. Mantener el sitemap al día

- Si añades nuevas **rutas públicas** (por ejemplo `/como-funciona`), inclúyelas en **`public/sitemap.xml`**.
- Opcional: actualizar **`lastmod`** cuando cambies contenido importante (puedes usar la fecha del último deploy).

---

## Resumen de prioridades

| Prioridad | Acción |
|-----------|--------|
| Alta     | Añadir **og-image.png** (1200×630) para compartir en redes. |
| Media    | Página pública tipo "Qué es / Cómo funciona" con palabras clave. |
| Media    | Revisar **PageSpeed / Core Web Vitals** y optimizar imágenes y carga. |
| Avanzada | **Prerender** de `/`, `/auth/login`, `/auth/register` para mejor indexación. |
| Continua | Enlaces desde redes y otros sitios; mantener **sitemap** actualizado. |

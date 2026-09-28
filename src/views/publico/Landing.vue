<template>
  <!--
    Portada pública de natillerapp.com. Es lo que ve Google y quien llega sin sesión (con
    sesión, el router manda directo a la natillera). Se pre-renderiza en el build
    (scripts/prerender-publico.mjs), así que no depende de nada del navegador: ni stores,
    ni CSS con scoped, ni números aleatorios. Solo Tailwind y SVG en línea.

    Estética ilustrada sobre fondo oscuro con la paleta de la marca: del verde bosque al
    #1B5E37, con el dorado de las monedas como acento. La escena cuenta el ahorro: una
    moneda que brilla, el árbol del ahorro, la línea de crecimiento, la alcancía y las
    barras. Los resplandores son gradientes radiales, no filtros de desenfoque ni
    backdrop-filter, que en iOS cuestan caro.
  -->
  <div class="min-h-screen supports-[height:100dvh]:min-h-[100dvh] bg-[#07170f] font-sans text-white" :class="{ 'lp-vivo': vivo }">
    <!-- ===================== Hero ===================== -->
    <section class="relative overflow-hidden bg-gradient-to-b from-[#04110a] via-[#0b2a1a] to-[#1B5E37]">
      <DestellosFondo />

      <CabeceraPublica en-portada />

      <div class="relative z-10 mx-auto grid max-w-6xl items-center gap-6 px-4 pb-16 pt-10 sm:px-6 sm:pb-24 sm:pt-16 lg:grid-cols-[1.15fr_1fr] lg:gap-10 lg:pb-24 lg:pt-12">
        <div>
          <p class="text-sm font-bold tracking-[0.18em] text-[#9fd9b1]">LA APP PARA TU NATILLERA</p>
          <!-- El H1 nombra lo que la gente busca («natillera»): es la señal más fuerte de la página tras el título. -->
          <h1 class="mt-3 max-w-xl font-display text-4xl font-light leading-[1.08] tracking-tight sm:text-6xl">
            Ahorra en grupo,<br />
            <span class="font-extrabold">crece con tu natillera</span>
          </h1>
          <p class="mt-5 max-w-md text-base leading-relaxed text-white/80 sm:text-lg">
            Cuotas, multas, préstamos, rifas y el cierre de fin de año en una app gratis.
            Tú registras; las cuentas se hacen solas.
          </p>
          <div class="mt-7 flex flex-col gap-3 sm:flex-row">
            <RouterLink
              to="/auth/register"
              class="inline-flex min-h-[52px] touch-manipulation items-center justify-center rounded-full bg-white px-7 text-base font-bold text-[#1B5E37] shadow-[0_10px_30px_-10px_rgba(185,228,198,0.7)] hover:bg-[#E8F5E9]"
            >
              Crear mi natillera gratis
            </RouterLink>
            <a
              href="#funciones"
              class="inline-flex min-h-[52px] touch-manipulation items-center justify-center rounded-full border border-white/30 px-7 text-base font-bold text-white hover:bg-white/10"
            >
              Conocer más
            </a>
          </div>
        </div>

        <EscenaAlcancia class="mx-auto w-full max-w-[22rem] sm:max-w-[28rem] lg:max-w-none" />
      </div>

      <!--
        Paso del verde del hero al oscuro de la página: una ola (la misma forma del login)
        con dos capas, una translúcida detrás que da profundidad y la sólida delante. Baja
        1 px dentro de la sección siguiente para que no quede costura de antialias.
      -->
      <svg
        class="pointer-events-none absolute inset-x-0 bottom-[-1px] h-16 w-full sm:h-24"
        viewBox="0 0 100 22"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d="M0 23 V8 C 18 0, 34 2, 50 9 S 80 20, 100 4 V23 Z" fill="#07170f" fill-opacity="0.45" />
        <path d="M0 23 V12 C 14 2, 28 1, 44 9 S 76 21, 100 6 V23 Z" fill="#07170f" />
      </svg>
    </section>

    <main>
      <!--
        Franja de lo que resuelve la app, justo bajo el hero. Cada concepto con su icono en
        una insignia que flota a su ritmo (en ola, uno tras otro) y se ilumina al pasar el
        dedo o el ratón. Entran escalonados con el scroll (lp-revelar-grupo).
      -->
      <div class="border-b border-white/5 bg-[#07170f]">
        <ul class="lp-revelar-grupo mx-auto grid max-w-6xl grid-cols-3 gap-x-2 gap-y-6 px-4 py-9 sm:grid-cols-6 sm:px-6" aria-label="Lo que puedes llevar">
          <li v-for="(c, i) in CONCEPTOS" :key="c.nombre" class="lp-concepto group flex flex-col items-center gap-2.5 text-center">
            <span class="lp-flotar block" :style="{ animationDelay: `${i * 0.35}s` }">
              <span class="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#9fd9b1]/25 bg-gradient-to-b from-[#1B5E37]/60 to-[#0b2a1a] shadow-[0_10px_24px_-12px_rgba(111,207,151,0.7)] transition-colors duration-300 group-hover:border-[#b9f0cc]/70 group-hover:from-[#1B5E37]">
                <component :is="c.icono" class="h-7 w-7 text-[#b9f0cc] transition-colors duration-300 group-hover:text-white" aria-hidden="true" />
              </span>
            </span>
            <span class="font-display text-sm font-extrabold tracking-wide text-white/85 transition-colors duration-300 group-hover:text-white sm:text-base">{{ c.nombre }}</span>
          </li>
        </ul>
      </div>
      <!-- ===================== Funciones ===================== -->
      <section id="funciones" class="scroll-mt-4 bg-[#07170f]">
        <div class="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div class="lp-revelar mx-auto max-w-2xl text-center">
            <p class="text-sm font-bold tracking-[0.18em] text-[#9fd9b1]">TODO EN UN LUGAR</p>
            <h2 class="mt-3 font-display text-3xl font-light uppercase tracking-[0.06em] sm:text-4xl">
              Administra tu natillera <span class="font-extrabold">sin enredos</span>
            </h2>
            <p class="mt-4 text-base leading-relaxed text-white/70">
              Una <strong class="text-white">natillera</strong> es un grupo de ahorro colectivo: amigos, familia o compañeros
              aportan una cuota fija, se prestan entre ellos y al final del año reparten el ahorro con las ganancias.
              Natillerapp es la plataforma web y la app que lleva esas cuentas por ti.
            </p>
          </div>

          <ul class="lp-revelar-grupo mt-14 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            <li v-for="funcion in FUNCIONES" :key="funcion.clave" class="flex gap-4">
              <span
                class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full"
                :class="COLOR_ICONO[funcion.clave]"
              >
                <component :is="ICONOS[funcion.clave]" class="h-6 w-6 text-white" aria-hidden="true" />
              </span>
              <div>
                <h3 class="font-display text-base font-extrabold">{{ funcion.titulo }}</h3>
                <p class="mt-1.5 text-sm leading-relaxed text-white/65">{{ funcion.texto }}</p>
              </div>
            </li>
          </ul>
        </div>
      </section>

      <!-- ===================== Préstamos (texto | ilustración) ===================== -->
      <section class="relative overflow-hidden bg-gradient-to-b from-[#07170f] to-[#0b2419]">
        <svg class="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true" preserveAspectRatio="none">
          <circle v-for="(e, i) in ESTRELLAS.slice(0, 18)" :key="i" :cx="(100 - e.x) + '%'" :cy="e.y + '%'" :r="e.r" fill="#e9f6ec" :opacity="e.o * 0.7" />
        </svg>
        <div class="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2">
          <div class="lp-revelar">
            <p class="text-sm font-bold tracking-[0.18em] text-[#9fd9b1]">PRÉSTAMOS ENTRE SOCIOS</p>
            <h2 class="mt-3 font-display text-3xl font-light sm:text-4xl">
              Ve más de lo que<br /><span class="font-extrabold">muestra el cuaderno</span>
            </h2>
            <p class="mt-5 max-w-md text-base leading-relaxed text-white/70">
              Cada préstamo con su plan de cuotas, el saldo al día y lo que va en intereses. Si alguien se atrasa, la mora
              se calcula sola y te dice cuánto necesita para ponerse al día.
            </p>
            <p class="mt-4 max-w-md text-base leading-relaxed text-white/70">
              Al cierre, esos intereses se reparten entre los socios como tú lo definas: por partes iguales o según lo que ahorró cada uno.
            </p>
            <RouterLink
              to="/auth/register"
              class="mt-8 inline-flex min-h-[48px] touch-manipulation items-center justify-center rounded-full border border-white/25 bg-white/10 px-6 text-sm font-bold hover:bg-white/20"
            >
              Empezar ahora
            </RouterLink>
          </div>

          <!-- Moneda gigante con monedas en órbita (los intereses que genera) y un socio mirándola -->
          <svg viewBox="0 0 520 440" class="lp-revelar lp-revelar--tarde mx-auto w-full max-w-md" aria-hidden="true">
            <defs>
              <radialGradient id="insigniaBrillo" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="#f6d77a" stop-opacity="0.6" />
                <stop offset="100%" stop-color="#f6d77a" stop-opacity="0" />
              </radialGradient>
              <radialGradient id="monedaCuerpo" cx="38%" cy="32%" r="75%">
                <stop offset="0%" stop-color="#3f9a67" />
                <stop offset="60%" stop-color="#1B5E37" />
                <stop offset="100%" stop-color="#0e3a22" />
              </radialGradient>
              <clipPath id="monedaClip"><circle cx="270" cy="250" r="150" /></clipPath>
            </defs>
            <!-- Órbita de fondo -->
            <ellipse cx="270" cy="250" rx="235" ry="70" transform="rotate(-18 270 250)" fill="none" stroke="#9fd9b1" stroke-opacity="0.25" stroke-width="2" stroke-dasharray="4 8" />
            <circle cx="270" cy="250" r="150" fill="url(#monedaCuerpo)" />
            <g clip-path="url(#monedaClip)" stroke="#6fbf8f" stroke-opacity="0.35" stroke-width="16" fill="none" stroke-linecap="round">
              <path d="M110 190 C 200 160 260 230 440 170" />
              <path d="M110 260 C 220 230 300 300 440 250" />
              <path d="M130 330 C 230 300 320 360 430 320" />
            </g>
            <circle cx="270" cy="250" r="150" fill="none" stroke="#9fd9b1" stroke-opacity="0.35" stroke-width="3" />
            <text x="270" y="272" text-anchor="middle" font-family="Mulish, sans-serif" font-size="72" font-weight="800" fill="#e9f6ec" fill-opacity="0.9">$</text>
            <!-- Monedas en la órbita, por delante -->
            <g v-for="(o, i) in ORBITA" :key="'o' + i" :transform="`translate(${o.x} ${o.y})`">
              <g class="lp-flotar" :style="{ animationDelay: `${i * 0.8}s` }">
                <circle :r="o.r" fill="#e8b93c" /><circle :r="o.r * 0.6" fill="#f6d77a" />
              </g>
            </g>
            <!-- Insignia de crecimiento -->
            <g class="lp-flotar" style="animation-delay: 0.4s">
              <circle class="lp-halo" cx="420" cy="92" r="70" fill="url(#insigniaBrillo)" />
              <circle cx="420" cy="92" r="28" fill="#e8b93c" />
              <path d="M408 102 L420 86 L432 102 M420 86 V 110" fill="none" stroke="#fff7d6" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" />
            </g>
            <!-- Socio -->
            <g fill="#06170e">
              <circle cx="200" cy="318" r="18" />
              <path d="M180 338 h40 l10 80 h-60 z" />
              <rect x="186" y="418" width="12" height="18" rx="3" />
              <rect x="202" y="418" width="12" height="18" rx="3" />
            </g>
            <ellipse cx="200" cy="438" rx="44" ry="5" fill="#000" opacity="0.35" />
          </svg>
        </div>
      </section>

      <!-- ===================== WhatsApp (ilustración | texto) ===================== -->
      <section class="relative overflow-hidden bg-gradient-to-b from-[#0b2419] to-[#07170f]">
        <div class="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2">
          <!-- Celular iluminado con el comprobante saliendo por WhatsApp -->
          <svg viewBox="0 0 440 460" class="lp-revelar lp-revelar--tarde order-2 mx-auto w-full max-w-sm lg:order-1" aria-hidden="true">
            <defs>
              <radialGradient id="celBrillo" cx="50%" cy="45%" r="55%">
                <stop offset="0%" stop-color="#b9e4c6" stop-opacity="0.45" />
                <stop offset="100%" stop-color="#b9e4c6" stop-opacity="0" />
              </radialGradient>
              <linearGradient id="celPantalla" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#2d7a4d" />
                <stop offset="100%" stop-color="#1B5E37" />
              </linearGradient>
            </defs>
            <circle class="lp-halo" cx="220" cy="210" r="210" fill="url(#celBrillo)" />
            <rect x="120" y="40" width="200" height="380" rx="28" fill="#0e2d1c" />
            <rect x="132" y="56" width="176" height="348" rx="18" fill="url(#celPantalla)" />
            <rect x="190" y="64" width="60" height="6" rx="3" fill="#0e2d1c" />
            <!-- Comprobante en la pantalla -->
            <rect x="150" y="96" width="140" height="170" rx="12" fill="#f4faf5" />
            <rect x="150" y="96" width="140" height="34" rx="12" fill="#e2f1e6" />
            <rect x="164" y="108" width="70" height="8" rx="4" fill="#1B5E37" />
            <rect x="164" y="146" width="112" height="26" rx="8" fill="#E8F5E9" />
            <rect x="178" y="155" width="84" height="8" rx="4" fill="#1B5E37" />
            <rect x="164" y="186" width="60" height="6" rx="3" fill="#94a3b8" /><rect x="244" y="186" width="32" height="6" rx="3" fill="#334155" />
            <rect x="164" y="204" width="50" height="6" rx="3" fill="#94a3b8" /><rect x="244" y="204" width="32" height="6" rx="3" fill="#334155" />
            <rect x="164" y="236" width="112" height="16" rx="8" fill="#1B5E37" />
            <!-- Burbuja de chat saliendo -->
            <g transform="translate(270 280)">
              <g class="lp-burbuja">
              <path d="M0 0 h110 a16 16 0 0 1 16 16 v40 a16 16 0 0 1 -16 16 h-78 l-18 16 v-16 h-14 a16 16 0 0 1 -16 -16 v-40 a16 16 0 0 1 16 -16 z" fill="#e9f6ec" />
              <path d="M22 36 l12 12 l24 -26" fill="none" stroke="#1B5E37" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" />
              <rect x="70" y="26" width="40" height="7" rx="3.5" fill="#94a3b8" />
              <rect x="70" y="40" width="28" height="7" rx="3.5" fill="#94a3b8" />
              </g>
            </g>
            <!-- Socio que recibe -->
            <g fill="#06170e">
              <circle cx="92" cy="330" r="16" />
              <path d="M74 348 h36 l8 72 h-52 z" />
              <path d="M106 356 l30 -26 l6 6 l-28 30 z" />
            </g>
            <ellipse cx="94" cy="424" rx="40" ry="5" fill="#000" opacity="0.35" />
          </svg>

          <div class="lp-revelar order-1 lg:order-2">
            <p class="text-sm font-bold tracking-[0.18em] text-[#9fd9b1]">EN TU CELULAR</p>
            <h2 class="mt-3 font-display text-3xl font-light uppercase tracking-[0.04em] sm:text-4xl">
              Comprobantes que<br /><span class="font-extrabold">llegan solos</span>
            </h2>
            <p class="mt-5 max-w-md text-base leading-relaxed text-white/70">
              Registra el pago en la reunión y mándale al socio su comprobante como imagen por WhatsApp. Cada quien sabe
              cuánto ha ahorrado y cuánto debe, sin preguntarte.
            </p>
            <p class="mt-4 max-w-md text-base leading-relaxed text-white/70">
              Funciona en el navegador y se instala en la pantalla de inicio de Android y de iPhone, como cualquier app.
            </p>
            <RouterLink
              to="/auth/register"
              class="mt-8 inline-flex min-h-[48px] touch-manipulation items-center justify-center rounded-full border border-white/25 bg-white/10 px-6 text-sm font-bold hover:bg-white/20"
            >
              Probarla gratis
            </RouterLink>
          </div>
        </div>
      </section>

      <!-- ===================== Cómo funciona ===================== -->
      <section id="como-funciona" class="scroll-mt-4 bg-[#07170f]">
        <div class="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div class="lp-revelar text-center">
            <p class="text-sm font-bold tracking-[0.18em] text-[#9fd9b1]">CÓMO FUNCIONA</p>
            <h2 class="mt-3 font-display text-3xl font-light uppercase tracking-[0.06em] sm:text-4xl">
              Empieza en <span class="font-extrabold">tres pasos</span>
            </h2>
          </div>
          <ol class="lp-revelar-grupo mt-12 grid gap-4 md:grid-cols-3">
            <li v-for="(paso, i) in PASOS" :key="paso.titulo" class="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
              <span class="flex h-11 w-11 items-center justify-center rounded-full bg-[#1B5E37] font-display text-lg font-extrabold text-white ring-4 ring-[#1B5E37]/30">{{ i + 1 }}</span>
              <h3 class="mt-4 font-display text-lg font-extrabold">{{ paso.titulo }}</h3>
              <p class="mt-1.5 text-sm leading-relaxed text-white/65">{{ paso.texto }}</p>
            </li>
          </ol>
        </div>
      </section>

      <!-- ===================== Soporte (texto | insignias) ===================== -->
      <!-- Misma gramática que Préstamos y WhatsApp: fondo en degradado con estrellas, texto a un
           lado y, al otro, las insignias flotantes de la franja de conceptos. Sin cajas. -->
      <section id="soporte" class="relative scroll-mt-4 overflow-hidden bg-gradient-to-b from-[#07170f] via-[#0b2419] to-[#07170f]">
        <svg class="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true" preserveAspectRatio="none">
          <circle v-for="(e, i) in ESTRELLAS.slice(18, 34)" :key="i" :cx="e.x + '%'" :cy="e.y + '%'" :r="e.r" fill="#e9f6ec" :opacity="e.o * 0.7" />
        </svg>
        <div class="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2">
          <div class="lp-revelar">
            <p class="text-sm font-bold tracking-[0.18em] text-[#9fd9b1]">SOPORTE</p>
            <h2 class="mt-3 font-display text-3xl font-light uppercase tracking-[0.04em] sm:text-4xl">
              Con dudas,<br /><span class="font-extrabold">no te quedas solo</span>
            </h2>
            <p class="mt-5 max-w-md text-base leading-relaxed text-white/70">
              ¿Algo no cuadra en una cuota, un préstamo o el cierre? Escríbenos por el chat de la app y te ayudamos.
              Sin costo.
            </p>
            <RouterLink
              to="/auth/register"
              class="mt-8 inline-flex min-h-[48px] touch-manipulation items-center justify-center rounded-full border border-white/25 bg-white/10 px-6 text-sm font-bold hover:bg-white/20"
            >
              Crear mi cuenta
            </RouterLink>
          </div>

          <ul class="lp-revelar-grupo flex flex-col gap-8">
            <li v-for="(item, i) in SOPORTE" :key="item.clave" class="lp-concepto group flex items-center gap-5">
              <span class="lp-flotar block flex-shrink-0" :style="{ animationDelay: `${i * 0.35}s` }">
                <span class="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#9fd9b1]/25 bg-gradient-to-b from-[#1B5E37]/60 to-[#0b2a1a] shadow-[0_10px_24px_-12px_rgba(111,207,151,0.7)] transition-colors duration-300 group-hover:border-[#b9f0cc]/70 group-hover:from-[#1B5E37]">
                  <component :is="ICONOS_SOPORTE[item.clave]" class="h-7 w-7 text-[#b9f0cc] transition-colors duration-300 group-hover:text-white" aria-hidden="true" />
                </span>
              </span>
              <div>
                <h3 class="font-display text-base font-extrabold">{{ item.titulo }}</h3>
                <p class="mt-1 max-w-sm text-sm leading-relaxed text-white/65">{{ item.texto }}</p>
              </div>
            </li>
          </ul>
        </div>
      </section>

      <!-- ===================== Preguntas frecuentes ===================== -->
      <!-- <details> nativo: se abre sin JavaScript y el buscador lee las respuestas -->
      <section id="preguntas" class="scroll-mt-4 bg-[#07170f]">
        <div class="mx-auto max-w-3xl px-4 pb-24 sm:px-6">
          <h2 class="lp-revelar text-center font-display text-3xl font-light uppercase tracking-[0.06em] sm:text-4xl">
            Preguntas <span class="font-extrabold">frecuentes</span>
          </h2>
          <div class="lp-revelar lp-revelar--tarde mt-10 divide-y divide-white/10 rounded-2xl border border-white/10 bg-white/[0.04]">
            <details v-for="item in PREGUNTAS" :key="item.pregunta" class="group">
              <summary class="flex min-h-[56px] cursor-pointer touch-manipulation list-none items-center justify-between gap-4 px-5 py-3 font-display text-base font-bold [&::-webkit-details-marker]:hidden">
                {{ item.pregunta }}
                <ChevronDownIcon class="h-5 w-5 flex-shrink-0 text-[#9fd9b1] transition-transform group-open:rotate-180 motion-reduce:transition-none" aria-hidden="true" />
              </summary>
              <p class="px-5 pb-5 text-sm leading-relaxed text-white/70">{{ item.respuesta }}</p>
            </details>
          </div>
          <p class="lp-revelar mt-5 text-center text-sm text-white/70">
            ¿Vas a armar una?
            <RouterLink to="/que-es-una-natillera" class="inline-flex min-h-[44px] touch-manipulation items-center font-bold text-[#b9f0cc] underline underline-offset-4 hover:text-white">Guía: qué es una natillera y cómo crearla</RouterLink>
          </p>

          <div class="lp-revelar mt-14 text-center">
            <p class="font-display text-2xl font-extrabold sm:text-3xl">Tu natillera, en orden desde hoy</p>
            <p class="mt-2 text-white/70">Crea tu cuenta gratis y registra tu primera cuota en minutos.</p>
            <div class="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <RouterLink
                to="/auth/register"
                class="inline-flex min-h-[52px] touch-manipulation items-center justify-center rounded-full bg-white px-7 text-base font-bold text-[#1B5E37] hover:bg-[#E8F5E9]"
              >
                Crear cuenta gratis
              </RouterLink>
              <RouterLink
                to="/auth/login"
                class="inline-flex min-h-[52px] touch-manipulation items-center justify-center rounded-full border border-white/30 px-7 text-base font-bold text-white hover:bg-white/10"
              >
                Ya tengo cuenta
              </RouterLink>
            </div>
          </div>
        </div>
      </section>
    </main>

    <PiePublico en-portada />
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import {
  BanknotesIcon,
  CalendarDaysIcon,
  BellAlertIcon,
  ChatBubbleLeftRightIcon,
  ChevronDownIcon,
  PaperClipIcon,
  ExclamationTriangleIcon,
  FlagIcon,
  TicketIcon,
  WalletIcon
} from '@heroicons/vue/24/outline'
import { FUNCIONES, PASOS, PREGUNTAS, SOPORTE } from './contenidoPublico'
import DestellosFondo from '../../components/publico/DestellosFondo.vue'
import CabeceraPublica from '../../components/publico/CabeceraPublica.vue'
import PiePublico from '../../components/publico/PiePublico.vue'
import { ICONOS_FUNCION as ICONOS, COLOR_FUNCION as COLOR_ICONO } from '../../components/publico/iconosFunciones'
import { ESTRELLAS } from '../../components/publico/escenaAhorro'
import EscenaAlcancia from '../../components/publico/EscenaAlcancia.vue'
import '../../components/publico/animacionesPublico.css'

const ICONOS_SOPORTE = {
  chat: ChatBubbleLeftRightIcon,
  adjuntos: PaperClipIcon,
  aviso: BellAlertIcon
}

const CONCEPTOS = [
  { nombre: 'Cuotas', icono: CalendarDaysIcon },
  { nombre: 'Multas', icono: ExclamationTriangleIcon },
  { nombre: 'Préstamos', icono: BanknotesIcon },
  { nombre: 'Rifas', icono: TicketIcon },
  { nombre: 'Caja', icono: WalletIcon },
  { nombre: 'Cierre', icono: FlagIcon }
]

// Monedas sobre la órbita de la sección de préstamos (puntos de una elipse girada -18°)
const ORBITA = [0.35, 2.1, 3.6, 5.3].map((t, i) => {
  const a = -18 * Math.PI / 180
  const x0 = 235 * Math.cos(t)
  const y0 = 70 * Math.sin(t)
  return {
    x: Math.round(270 + x0 * Math.cos(a) - y0 * Math.sin(a)),
    y: Math.round(250 + x0 * Math.sin(a) + y0 * Math.cos(a)),
    r: [16, 11, 13, 9][i]
  }
})

/*
 * Las animaciones arrancan cuando la app ya montó. El HTML pre-renderizado llega quieto;
 * si se animara desde ahí, al montar Vue el DOM se reemplaza y todo empezaría otra vez.
 */
const vivo = ref(false)

/*
 * Aparición al hacer scroll: cada bloque `.lp-revelar` (o cada hijo de un
 * `.lp-revelar-grupo`) recibe `.lp-visible` la primera vez que entra en pantalla, y el
 * CSS lo hace subir con un fundido. Lo que está oculto solo lo está bajo `.lp-vivo`, o
 * sea después de montar: el HTML pre-renderizado y quien no tenga JavaScript lo ven todo.
 * Sin IntersectionObserver (navegadores muy viejos) se muestra todo de una vez.
 */
let observador = null
onMounted(() => {
  vivo.value = true
  const objetivos = document.querySelectorAll('.lp-revelar, .lp-revelar-grupo')
  if (typeof IntersectionObserver === 'undefined') {
    objetivos.forEach(el => el.classList.add('lp-visible'))
    return
  }
  observador = new IntersectionObserver((entradas) => {
    entradas.forEach(entrada => {
      if (!entrada.isIntersecting) return
      entrada.target.classList.add('lp-visible')
      observador.unobserve(entrada.target)
    })
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 })
  objetivos.forEach(el => observador.observe(el))
})
onBeforeUnmount(() => observador?.disconnect())
</script>

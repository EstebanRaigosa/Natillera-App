<template>
  <!--
    Guía «Qué es una natillera» (/que-es-una-natillera). Es la página del sitio que compite
    por las búsquedas de quien quiere entender o armar una natillera, así que es una guía
    de verdad y no un folleto: responde, en orden, lo que esa persona pregunta.

    Mismo lenguaje visual que la portada (Landing.vue): fondo verde noche, antetítulo en
    verde claro, titular en Mulish ligera con remate en extrabold, insignias de icono y
    tarjetas translúcidas. Llega pre-renderizada (scripts/prerender-publico.mjs), así que
    no depende de nada del navegador: ni stores ni animaciones que oculten contenido.

    Lo que se dice de la app sale de contenidoPublico.js (FUNCIONES): no inventar funciones.
  -->
  <div class="min-h-screen supports-[height:100dvh]:min-h-[100dvh] bg-[#07170f] font-sans text-white">
    <!-- ===================== Hero ===================== -->
    <section class="relative overflow-hidden bg-gradient-to-b from-[#04110a] via-[#0b2a1a] to-[#1B5E37]">
      <DestellosFondo />
      <CabeceraPublica />

      <div class="relative z-10 mx-auto max-w-6xl px-4 pb-24 pt-8 sm:px-6 sm:pb-32 sm:pt-14">
        <p class="text-sm font-bold tracking-[0.18em] text-[#9fd9b1]">GUÍA DE NATILLERAS</p>
        <h1 class="mt-3 max-w-3xl font-display text-4xl font-light leading-[1.08] tracking-tight sm:text-6xl">
          ¿Qué es una natillera<br />
          <span class="font-extrabold">y cómo funciona?</span>
        </h1>
        <p class="mt-5 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
          Todo lo que necesitas para entender una natillera, armar la tuya con reglas claras y llegar a diciembre con las cuentas en orden.
        </p>
        <!-- Índice: cada sección a un toque (anclas nativas: funcionan sin JavaScript) -->
        <nav aria-label="Contenido de la guía" class="mt-8 flex flex-wrap gap-2">
          <a
            v-for="s in SECCIONES"
            :key="s.id"
            :href="`#${s.id}`"
            class="inline-flex min-h-[44px] touch-manipulation items-center rounded-full border border-white/25 bg-white/10 px-4 text-sm font-bold text-white hover:bg-white/20"
            @click.prevent="irA(s.id)"
          >{{ s.corto }}</a>
        </nav>
      </div>

      <!-- Paso al verde noche de la página: la misma ola de la portada -->
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
      <!-- ===================== Qué es ===================== -->
      <section :id="SECCIONES[0].id" class="scroll-mt-4 bg-[#07170f]">
        <div class="mx-auto grid max-w-6xl items-start gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <p class="text-sm font-bold tracking-[0.18em] text-[#9fd9b1]">LO BÁSICO</p>
            <h2 class="mt-3 font-display text-3xl font-light sm:text-4xl">
              ¿Qué es una <span class="font-extrabold">natillera</span>?
            </h2>
            <p class="mt-5 text-base leading-relaxed text-white/75 sm:text-lg">
              Una natillera es un grupo de ahorro colectivo: varias personas de confianza —familia, amigos, vecinos o compañeros de trabajo— se comprometen a aportar una cuota fija cada semana, quincena o mes durante el año.
              Con ese fondo común se hacen préstamos entre los socios y actividades como rifas o bingos, y al final del ciclo cada uno recibe lo que ahorró más su parte de las ganancias.
            </p>
            <p class="mt-4 text-base leading-relaxed text-white/75 sm:text-lg">
              Es una tradición muy arraigada en Colombia, sobre todo en Antioquia. El nombre viene de diciembre, la época de la natilla, que es cuando tradicionalmente se reparte el ahorro.
            </p>
          </div>
          <aside class="rounded-2xl border border-white/10 bg-white/[0.04] p-6" aria-label="En corto">
            <p class="text-xs font-bold tracking-[0.16em] text-[#9fd9b1]">EN CORTO</p>
            <ul class="mt-4 space-y-4">
              <li v-for="d in EN_CORTO" :key="d.texto" class="flex items-start gap-3">
                <span class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-[#9fd9b1]/25 bg-gradient-to-b from-[#1B5E37]/60 to-[#0b2a1a]">
                  <component :is="d.icono" class="h-5 w-5 text-[#b9f0cc]" aria-hidden="true" />
                </span>
                <span class="pt-2 text-sm leading-relaxed text-white/80 sm:text-base">{{ d.texto }}</span>
              </li>
            </ul>
          </aside>
        </div>
      </section>

      <!-- ===================== Cómo funciona ===================== -->
      <section :id="SECCIONES[1].id" class="relative scroll-mt-4 overflow-hidden bg-gradient-to-b from-[#07170f] to-[#0b2419]">
        <svg class="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true" preserveAspectRatio="none">
          <circle v-for="(e, i) in ESTRELLAS.slice(0, 18)" :key="i" :cx="(100 - e.x) + '%'" :cy="e.y + '%'" :r="e.r" fill="#e9f6ec" :opacity="e.o * 0.7" />
        </svg>
        <div class="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <div class="max-w-2xl">
            <p class="text-sm font-bold tracking-[0.18em] text-[#9fd9b1]">CÓMO FUNCIONA</p>
            <h2 class="mt-3 font-display text-3xl font-light sm:text-4xl">
              ¿Cómo funciona <span class="font-extrabold">una natillera</span>?
            </h2>
          </div>
          <ul class="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            <li v-for="item in COMO_FUNCIONA" :key="item.titulo" class="flex gap-4">
              <span class="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl border border-[#9fd9b1]/25 bg-gradient-to-b from-[#1B5E37]/60 to-[#0b2a1a] shadow-[0_10px_24px_-12px_rgba(111,207,151,0.7)]">
                <component :is="item.icono" class="h-7 w-7 text-[#b9f0cc]" aria-hidden="true" />
              </span>
              <div>
                <h3 class="font-display text-base font-extrabold">{{ item.titulo }}</h3>
                <p class="mt-1.5 text-sm leading-relaxed text-white/65">{{ item.texto }}</p>
              </div>
            </li>
          </ul>
        </div>
      </section>

      <!-- ===================== Cómo crearla ===================== -->
      <section :id="SECCIONES[2].id" class="scroll-mt-4 bg-[#0b2419]">
        <div class="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <div class="max-w-2xl">
            <p class="text-sm font-bold tracking-[0.18em] text-[#9fd9b1]">EMPIEZA LA TUYA</p>
            <h2 class="mt-3 font-display text-3xl font-light sm:text-4xl">
              Cómo crear una natillera <span class="font-extrabold">paso a paso</span>
            </h2>
          </div>
          <ol class="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <li v-for="(paso, i) in PASOS_CREAR" :key="paso.titulo" class="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
              <span class="flex h-11 w-11 items-center justify-center rounded-full bg-[#1B5E37] font-display text-lg font-extrabold text-white ring-4 ring-[#1B5E37]/30">{{ i + 1 }}</span>
              <h3 class="mt-4 font-display text-lg font-extrabold">{{ paso.titulo }}</h3>
              <p class="mt-1.5 text-sm leading-relaxed text-white/65">{{ paso.texto }}</p>
            </li>
          </ol>
        </div>
      </section>

      <!-- ===================== Reglamento ===================== -->
      <section :id="SECCIONES[3].id" class="relative scroll-mt-4 overflow-hidden bg-gradient-to-b from-[#0b2419] via-[#07170f] to-[#07170f]">
        <svg class="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true" preserveAspectRatio="none">
          <circle v-for="(e, i) in ESTRELLAS.slice(18, 34)" :key="i" :cx="e.x + '%'" :cy="e.y + '%'" :r="e.r" fill="#e9f6ec" :opacity="e.o * 0.7" />
        </svg>
        <div class="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <div class="max-w-2xl">
            <p class="text-sm font-bold tracking-[0.18em] text-[#9fd9b1]">EL REGLAMENTO</p>
            <h2 class="mt-3 font-display text-3xl font-light sm:text-4xl">
              Qué reglas <span class="font-extrabold">acordar</span>
            </h2>
            <p class="mt-5 text-base leading-relaxed text-white/75 sm:text-lg">
              La mayoría de los problemas en una natillera no son de plata sino de reglas que nadie escribió. Antes de recibir la primera cuota, dejen por escrito:
            </p>
          </div>
          <ul class="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <li v-for="regla in REGLAS" :key="regla.titulo" class="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <span class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-[#9fd9b1]/25 bg-gradient-to-b from-[#1B5E37]/60 to-[#0b2a1a]">
                <component :is="regla.icono" class="h-5 w-5 text-[#b9f0cc]" aria-hidden="true" />
              </span>
              <div>
                <h3 class="font-display text-base font-extrabold">{{ regla.titulo }}</h3>
                <p class="mt-1 text-sm leading-relaxed text-white/65">{{ regla.texto }}</p>
              </div>
            </li>
          </ul>
        </div>
      </section>

      <!-- ===================== Reparto ===================== -->
      <section :id="SECCIONES[4].id" class="scroll-mt-4 bg-[#07170f]">
        <div class="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <div class="max-w-2xl">
            <p class="text-sm font-bold tracking-[0.18em] text-[#9fd9b1]">EL CIERRE</p>
            <h2 class="mt-3 font-display text-3xl font-light sm:text-4xl">
              ¿Cómo se reparten <span class="font-extrabold">las ganancias</span>?
            </h2>
            <p class="mt-5 text-base leading-relaxed text-white/75 sm:text-lg">
              Al cierre, cada socio recibe su ahorro completo. Lo que se discute es cómo repartir las ganancias: los intereses de los préstamos, lo que dejaron las actividades y las multas. Hay dos formas comunes:
            </p>
          </div>
          <div class="mt-10 grid gap-4 md:grid-cols-2">
            <div v-for="forma in FORMAS_REPARTO" :key="forma.titulo" class="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-6">
              <span class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full" :class="forma.color">
                <component :is="forma.icono" class="h-6 w-6 text-white" aria-hidden="true" />
              </span>
              <div>
                <h3 class="font-display text-lg font-extrabold">{{ forma.titulo }}</h3>
                <p class="mt-1.5 text-sm leading-relaxed text-white/70 sm:text-base">{{ forma.texto }}</p>
              </div>
            </div>
          </div>
          <p class="mt-6 max-w-3xl text-base leading-relaxed text-white/75">
            Antes de repartir se descuentan los gastos de administración que hayan acordado y lo que cada socio aún deba, como un préstamo sin pagar o multas pendientes.
          </p>
        </div>
      </section>

      <!-- ===================== En Natillerapp ===================== -->
      <section :id="SECCIONES[5].id" class="relative scroll-mt-4 overflow-hidden bg-gradient-to-b from-[#07170f] via-[#0b2419] to-[#07170f]">
        <div class="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <div class="max-w-2xl">
            <p class="text-sm font-bold tracking-[0.18em] text-[#9fd9b1]">LLÉVALA EN LA APP</p>
            <h2 class="mt-3 font-display text-3xl font-light sm:text-4xl">
              Cómo llevar tu natillera <span class="font-extrabold">en Natillerapp</span>
            </h2>
            <p class="mt-5 text-base leading-relaxed text-white/75 sm:text-lg">
              Natillerapp es una plataforma web y una app para administrar natilleras: reemplaza el cuaderno y la planilla de Excel por un programa que hace las cuentas solo.
              Funciona en línea desde el celular, la tablet o la computadora, y se puede instalar como aplicación.
            </p>
          </div>
          <ul class="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            <li v-for="f in FUNCIONES" :key="f.clave" class="flex gap-4">
              <span class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full" :class="COLOR_FUNCION[f.clave]">
                <component :is="ICONOS_FUNCION[f.clave]" class="h-6 w-6 text-white" aria-hidden="true" />
              </span>
              <div>
                <h3 class="font-display text-base font-extrabold">{{ f.titulo }}</h3>
                <p class="mt-1.5 text-sm leading-relaxed text-white/65">{{ f.texto }}</p>
              </div>
            </li>
          </ul>
        </div>
      </section>

      <!-- ===================== Llamado a la acción ===================== -->
      <section class="bg-[#07170f]">
        <div class="mx-auto max-w-3xl px-4 pb-24 pt-8 text-center sm:px-6">
          <p class="font-display text-2xl font-extrabold sm:text-3xl">Arma tu natillera en Natillerapp</p>
          <p class="mt-2 text-white/70">Crea la natillera, agrega a los socios y registra la primera cuota en unos minutos.</p>
          <div class="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <RouterLink
              to="/auth/register"
              class="inline-flex min-h-[52px] touch-manipulation items-center justify-center rounded-full bg-white px-7 text-base font-bold text-[#1B5E37] hover:bg-[#E8F5E9]"
            >
              Crear mi natillera
            </RouterLink>
            <RouterLink
              to="/auth/login"
              class="inline-flex min-h-[52px] touch-manipulation items-center justify-center px-4 text-base font-semibold text-white/80 underline-offset-4 hover:text-white hover:underline"
            >
              Ya tengo cuenta
            </RouterLink>
          </div>
        </div>
      </section>
    </main>

    <PiePublico />
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router'
import {
  BanknotesIcon,
  CalendarDaysIcon,
  ExclamationTriangleIcon,
  FlagIcon,
  ScaleIcon,
  TicketIcon,
  UserCircleIcon,
  UserGroupIcon,
  UserMinusIcon
} from '@heroicons/vue/24/outline'
import { FUNCIONES } from './contenidoPublico'
import DestellosFondo from '../../components/publico/DestellosFondo.vue'
import CabeceraPublica from '../../components/publico/CabeceraPublica.vue'
import PiePublico from '../../components/publico/PiePublico.vue'
import { ESTRELLAS } from '../../components/publico/escenaAhorro'
import { ICONOS_FUNCION, COLOR_FUNCION } from '../../components/publico/iconosFunciones'

const SECCIONES = [
  { id: 'que-es', corto: 'Qué es' },
  { id: 'como-funciona', corto: 'Cómo funciona' },
  { id: 'como-crear', corto: 'Cómo crearla' },
  { id: 'reglamento', corto: 'Reglamento' },
  { id: 'reparto', corto: 'Reparto' },
  { id: 'natillerapp', corto: 'En la app' }
]

const EN_CORTO = [
  { icono: CalendarDaysIcon, texto: 'Una cuota fija cada semana, quincena o mes.' },
  { icono: BanknotesIcon, texto: 'Préstamos entre socios, con interés para el grupo.' },
  { icono: FlagIcon, texto: 'Al final del año, cada uno recibe su ahorro y las ganancias.' }
]

// Los mismos iconos que la franja de conceptos de la portada, para que cada idea se vea igual.
const COMO_FUNCIONA = [
  { icono: CalendarDaysIcon, titulo: 'Cuota fija', texto: 'Cada socio aporta el mismo valor en cada periodo (semanal, quincenal o mensual). Algunas natilleras permiten que un socio tenga varias cuotas.' },
  { icono: UserCircleIcon, titulo: 'Un administrador', texto: 'Una persona, o un pequeño equipo, recibe los pagos, lleva las cuentas y responde por el dinero ante el grupo.' },
  { icono: BanknotesIcon, titulo: 'Préstamos entre socios', texto: 'El dinero no se queda quieto: se presta a los socios con un interés acordado, y esos intereses son ganancia para todos.' },
  { icono: TicketIcon, titulo: 'Actividades', texto: 'Rifas, bingos, ventas o eventos suman al fondo y hacen crecer las ganancias.' },
  { icono: ExclamationTriangleIcon, titulo: 'Multas por mora', texto: 'Quien paga tarde paga una multa según las reglas del grupo; también va al fondo.' },
  { icono: FlagIcon, titulo: 'Cierre', texto: 'Al final del ciclo, normalmente en noviembre o diciembre, se devuelve el ahorro y se reparten las ganancias.' }
]

const PASOS_CREAR = [
  { titulo: 'Reúne al grupo', texto: 'Personas de confianza que puedan cumplir con la cuota todo el año. Un grupo de 10 a 30 socios es fácil de manejar.' },
  { titulo: 'Define la cuota y la periodicidad', texto: 'Un valor que todos puedan pagar sin apretarse, y si se paga cada semana, cada quincena o cada mes.' },
  { titulo: 'Acuerden el reglamento', texto: 'Fechas de pago, multas, intereses de los préstamos y cómo se reparte al final. Abajo está qué incluir.' },
  { titulo: 'Elijan quién administra', texto: 'Y dónde se guarda el dinero: efectivo, una cuenta bancaria o ambas, con claridad sobre cada una.' },
  { titulo: 'Registren cada movimiento', texto: 'Cada cuota, préstamo y pago, con fecha. Que cualquier socio pueda ver cómo va su ahorro evita la mayoría de los malentendidos.' }
]

const REGLAS = [
  { icono: CalendarDaysIcon, titulo: 'Fechas de pago', texto: 'Qué día vence cada cuota y cuántos días de gracia hay antes de cobrar multa.' },
  { icono: ExclamationTriangleIcon, titulo: 'Multas', texto: 'Un valor fijo o un porcentaje por cada día o periodo de atraso.' },
  { icono: BanknotesIcon, titulo: 'Préstamos', texto: 'Quién puede pedir, cuánto como máximo, a qué interés, en cuántas cuotas y qué pasa si se atrasa.' },
  { icono: UserMinusIcon, titulo: 'Retiro de un socio', texto: 'Si alguien se sale antes de tiempo, cuándo y cómo se le devuelve lo ahorrado, y si pierde las ganancias.' },
  { icono: ScaleIcon, titulo: 'Reparto', texto: 'Si las ganancias se reparten en partes iguales o según lo ahorrado, y qué gastos se descuentan antes.' },
  { icono: FlagIcon, titulo: 'Fecha de cierre', texto: 'Cuándo termina el ciclo y cuándo se entrega el dinero.' }
]

const FORMAS_REPARTO = [
  {
    icono: UserGroupIcon,
    color: 'bg-gradient-to-br from-[#2d7a4d] to-[#1B5E37]',
    titulo: 'Equitativo',
    texto: 'Las ganancias se dividen en partes iguales entre los socios, sin importar cuánto ahorró cada uno.'
  },
  {
    icono: ScaleIcon,
    color: 'bg-gradient-to-br from-[#d9a52e] to-[#b8841a]',
    titulo: 'Proporcional',
    texto: 'Cada socio recibe ganancias según lo que aportó: quien ahorró el doble recibe el doble.'
  }
]

// Sin cambiar la URL: el hash lo usa el router y romper el «atrás» no vale la pena.
function irA(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

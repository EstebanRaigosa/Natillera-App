<template>
  <!--
    Guía «Qué es una natillera» (/que-es-una-natillera). Es la página del sitio que compite
    por las búsquedas de quien quiere entender o armar una natillera, así que es una guía
    de verdad y no un folleto: responde, en orden, lo que esa persona pregunta. Llega
    pre-renderizada en el build (scripts/prerender-publico.mjs): solo Tailwind, sin stores.

    Lo que se dice de la app sale de contenidoPublico.js (FUNCIONES): no inventar funciones.
  -->
  <main class="animate-fade-in-up">
    <article class="relative overflow-hidden rounded-2xl border-2 border-white/60 bg-white/95 text-gray-800 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15),0_0_0_1px_rgba(34,197,94,0.05)] sm:rounded-3xl">
      <header class="relative border-b border-natillera-200/60 bg-gradient-to-br from-natillera-500/15 via-emerald-500/10 to-teal-500/15 px-5 py-6 sm:px-8 sm:py-8">
        <p class="text-xs font-bold tracking-[0.16em] text-natillera-700">GUÍA</p>
        <h1 class="mt-1 font-display text-2xl font-extrabold text-gray-900 sm:text-3xl lg:text-4xl">
          ¿Qué es una natillera y cómo funciona?
        </h1>
        <p class="mt-3 max-w-3xl text-base leading-relaxed text-gray-600 sm:text-lg">
          Todo lo que necesitas para entender una natillera, armar la tuya con reglas claras y llegar a diciembre con las cuentas en orden.
        </p>
        <!-- Índice: cada sección a un toque (anclas nativas, funcionan sin JavaScript) -->
        <nav aria-label="Contenido de la guía" class="mt-5 flex flex-wrap gap-2">
          <a
            v-for="s in SECCIONES"
            :key="s.id"
            :href="`#${s.id}`"
            class="inline-flex min-h-[44px] touch-manipulation items-center rounded-full border border-natillera-200 bg-white/80 px-4 text-sm font-semibold text-natillera-800 hover:bg-natillera-50"
            @click.prevent="irA(s.id)"
          >{{ s.corto }}</a>
        </nav>
      </header>

      <div class="space-y-10 px-5 py-8 text-base leading-relaxed text-gray-700 sm:px-8 lg:px-12">
        <section :id="SECCIONES[0].id" class="scroll-mt-6">
          <h2 class="font-display text-xl font-extrabold text-natillera-800 sm:text-2xl">{{ SECCIONES[0].titulo }}</h2>
          <p class="mt-3">
            Una natillera es un grupo de ahorro colectivo: varias personas de confianza —familia, amigos, vecinos o compañeros de trabajo— se comprometen a aportar una cuota fija cada semana, quincena o mes durante el año.
            Con ese fondo común se hacen préstamos entre los socios y actividades como rifas o bingos, y al final del ciclo cada uno recibe lo que ahorró más su parte de las ganancias.
          </p>
          <p class="mt-3">
            Es una tradición muy arraigada en Colombia, sobre todo en Antioquia. El nombre viene de diciembre, la época de la natilla, que es cuando tradicionalmente se reparte el ahorro.
          </p>
        </section>

        <section :id="SECCIONES[1].id" class="scroll-mt-6">
          <h2 class="font-display text-xl font-extrabold text-natillera-800 sm:text-2xl">{{ SECCIONES[1].titulo }}</h2>
          <ul class="mt-4 space-y-3">
            <li v-for="item in COMO_FUNCIONA" :key="item.titulo" class="flex gap-3">
              <span class="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-natillera-500" aria-hidden="true" />
              <span><strong class="text-gray-900">{{ item.titulo }}.</strong> {{ item.texto }}</span>
            </li>
          </ul>
        </section>

        <section :id="SECCIONES[2].id" class="scroll-mt-6">
          <h2 class="font-display text-xl font-extrabold text-natillera-800 sm:text-2xl">{{ SECCIONES[2].titulo }}</h2>
          <ol class="mt-4 space-y-4">
            <li v-for="(paso, i) in PASOS_CREAR" :key="paso.titulo" class="flex gap-4">
              <span class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-natillera-600 font-display text-sm font-extrabold text-white">{{ i + 1 }}</span>
              <span class="pt-1"><strong class="text-gray-900">{{ paso.titulo }}.</strong> {{ paso.texto }}</span>
            </li>
          </ol>
        </section>

        <section :id="SECCIONES[3].id" class="scroll-mt-6">
          <h2 class="font-display text-xl font-extrabold text-natillera-800 sm:text-2xl">{{ SECCIONES[3].titulo }}</h2>
          <p class="mt-3">
            La mayoría de los problemas en una natillera no son de plata sino de reglas que nadie escribió. Antes de recibir la primera cuota, dejen por escrito:
          </p>
          <ul class="mt-4 grid gap-3 sm:grid-cols-2">
            <li v-for="regla in REGLAS" :key="regla.titulo" class="rounded-xl border border-natillera-100 bg-natillera-50/40 p-4">
              <strong class="block font-display text-gray-900">{{ regla.titulo }}</strong>
              <span class="mt-1 block text-sm sm:text-base">{{ regla.texto }}</span>
            </li>
          </ul>
        </section>

        <section :id="SECCIONES[4].id" class="scroll-mt-6">
          <h2 class="font-display text-xl font-extrabold text-natillera-800 sm:text-2xl">{{ SECCIONES[4].titulo }}</h2>
          <p class="mt-3">
            Al cierre, cada socio recibe su ahorro completo. Lo que se discute es cómo repartir las ganancias: los intereses de los préstamos, lo que dejaron las actividades y las multas. Hay dos formas comunes:
          </p>
          <div class="mt-4 grid gap-3 sm:grid-cols-2">
            <div class="rounded-xl border border-natillera-100 p-4">
              <strong class="block font-display text-gray-900">Equitativo</strong>
              <span class="mt-1 block text-sm sm:text-base">Las ganancias se dividen en partes iguales entre los socios, sin importar cuánto ahorró cada uno.</span>
            </div>
            <div class="rounded-xl border border-natillera-100 p-4">
              <strong class="block font-display text-gray-900">Proporcional</strong>
              <span class="mt-1 block text-sm sm:text-base">Cada socio recibe ganancias según lo que aportó: quien ahorró el doble recibe el doble.</span>
            </div>
          </div>
          <p class="mt-4">
            Antes de repartir se descuentan los gastos de administración que hayan acordado y lo que cada socio aún deba, como un préstamo sin pagar o multas pendientes.
          </p>
        </section>

        <section :id="SECCIONES[5].id" class="scroll-mt-6">
          <h2 class="font-display text-xl font-extrabold text-natillera-800 sm:text-2xl">{{ SECCIONES[5].titulo }}</h2>
          <p class="mt-3">
            Natillerapp es una plataforma web y una app para administrar natilleras: reemplaza el cuaderno y la planilla de Excel por un programa que hace las cuentas solo.
            Funciona en línea desde el celular, la tablet o la computadora, y se puede instalar como aplicación.
          </p>
          <ul class="mt-4 grid gap-3 sm:grid-cols-2">
            <li v-for="f in FUNCIONES" :key="f.clave" class="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
              <strong class="block font-display text-natillera-800">{{ f.titulo }}</strong>
              <span class="mt-1 block text-sm sm:text-base">{{ f.texto }}</span>
            </li>
          </ul>
        </section>

        <!-- Llamado a la acción -->
        <section class="rounded-2xl border-2 border-natillera-200/70 bg-gradient-to-br from-natillera-50 via-white to-emerald-50 p-5 sm:p-7">
          <p class="font-display text-lg font-extrabold text-gray-900 sm:text-xl">Arma tu natillera en Natillerapp</p>
          <p class="mt-1 text-gray-600">Crea la natillera, agrega a los socios y registra la primera cuota en unos minutos.</p>
          <div class="mt-4 flex flex-col gap-3 sm:flex-row">
            <RouterLink to="/auth/register" class="btn-primary flex min-h-[48px] touch-manipulation items-center justify-center text-center">
              Crear mi natillera
            </RouterLink>
            <RouterLink to="/auth/login" class="btn-secondary flex min-h-[48px] touch-manipulation items-center justify-center border-2 text-center">
              Ya tengo cuenta
            </RouterLink>
          </div>
        </section>
      </div>
    </article>
  </main>
</template>

<script setup>
import { RouterLink } from 'vue-router'
import { FUNCIONES } from '../publico/contenidoPublico'

const SECCIONES = [
  { id: 'que-es', corto: 'Qué es', titulo: '¿Qué es una natillera?' },
  { id: 'como-funciona', corto: 'Cómo funciona', titulo: '¿Cómo funciona una natillera?' },
  { id: 'como-crear', corto: 'Cómo crearla', titulo: 'Cómo crear una natillera paso a paso' },
  { id: 'reglamento', corto: 'Reglamento', titulo: 'Qué reglas acordar: el reglamento' },
  { id: 'reparto', corto: 'Reparto', titulo: '¿Cómo se reparten las ganancias?' },
  { id: 'natillerapp', corto: 'Llevarla en la app', titulo: 'Cómo llevar tu natillera en Natillerapp' }
]

const COMO_FUNCIONA = [
  { titulo: 'Cuota fija', texto: 'Cada socio aporta el mismo valor en cada periodo (semanal, quincenal o mensual). Algunas natilleras permiten que un socio tenga varias cuotas.' },
  { titulo: 'Un administrador', texto: 'Una persona, o un pequeño equipo, recibe los pagos, lleva las cuentas y responde por el dinero ante el grupo.' },
  { titulo: 'Préstamos entre socios', texto: 'El dinero no se queda quieto: se presta a los socios con un interés acordado, y esos intereses son ganancia para todos.' },
  { titulo: 'Actividades', texto: 'Rifas, bingos, ventas o eventos suman al fondo y hacen crecer las ganancias.' },
  { titulo: 'Multas por mora', texto: 'Quien paga tarde paga una multa según las reglas del grupo; también va al fondo.' },
  { titulo: 'Cierre', texto: 'Al final del ciclo, normalmente en noviembre o diciembre, se devuelve el ahorro y se reparten las ganancias.' }
]

const PASOS_CREAR = [
  { titulo: 'Reúne al grupo', texto: 'Personas de confianza que puedan cumplir con la cuota todo el año. Un grupo de 10 a 30 socios es fácil de manejar.' },
  { titulo: 'Define la cuota y la periodicidad', texto: 'Un valor que todos puedan pagar sin apretarse, y si se paga cada semana, cada quincena o cada mes.' },
  { titulo: 'Acuerden el reglamento', texto: 'Fechas de pago, multas, intereses de los préstamos y cómo se reparte al final. Mira abajo qué incluir.' },
  { titulo: 'Elijan quién administra', texto: 'Y dónde se guarda el dinero: efectivo, una cuenta bancaria o ambas, con claridad sobre cada una.' },
  { titulo: 'Registren cada movimiento', texto: 'Cada cuota, préstamo y pago, con fecha. Que cualquier socio pueda ver cómo va su ahorro evita la mayoría de los malentendidos.' }
]

const REGLAS = [
  { titulo: 'Fechas de pago', texto: 'Qué día vence cada cuota y cuántos días de gracia hay antes de cobrar multa.' },
  { titulo: 'Multas', texto: 'Un valor fijo o un porcentaje por cada día o periodo de atraso.' },
  { titulo: 'Préstamos', texto: 'Quién puede pedir, cuánto como máximo, a qué interés, en cuántas cuotas y qué pasa si se atrasa.' },
  { titulo: 'Retiro de un socio', texto: 'Si alguien se sale antes de tiempo, cuándo y cómo se le devuelve lo ahorrado, y si pierde las ganancias.' },
  { titulo: 'Reparto', texto: 'Si las ganancias se reparten en partes iguales o según lo ahorrado, y qué gastos se descuentan antes.' },
  { titulo: 'Fecha de cierre', texto: 'Cuándo termina el ciclo y cuándo se entrega el dinero.' }
]

// Sin cambiar la URL: el hash lo usa el router y romper el «atrás» no vale la pena.
function irA(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

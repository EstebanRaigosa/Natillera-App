<template>
  <!--
    Pantallas de cuenta (login, registro, bienvenida, restablecer, «qué es»). Mismo mundo
    visual que la portada: fondo del verde bosque al #1B5E37 con destellos, y la escena del
    ahorro (components/publico).

    Con formulario hay un solo árbol para todos los tamaños (un único <router-view>: montar
    el formulario dos veces duplicaría ids y estado), y las clases lo acomodan:
      · Celular: la escena ocupa la parte de arriba con el logo y un saludo según la
        pantalla, y el formulario sube encima en una hoja blanca de esquinas redondeadas.
      · Escritorio (lg): una tarjeta centrada partida en dos, escena a la izquierda y
        formulario a la derecha, separados por una ola blanca.

    «Qué es Natillerapp» trae su propio artículo con fondo: va sin tarjeta, a todo el ancho.
  -->
  <div class="relative min-h-screen min-h-[100dvh] overflow-hidden bg-gradient-to-b from-[#04110a] via-[#0b2a1a] to-[#154a2d] text-white">
    <DestellosFondo class="hidden lg:block" />

    <!-- BETA: en la esquina en escritorio; en el celular va junto al logo para no montarse encima -->
    <div class="absolute right-[max(1rem,env(safe-area-inset-right,0px))] top-[max(1rem,env(safe-area-inset-top,0px))] z-30 hidden lg:block">
      <span class="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-bold tracking-[0.08em] text-white/85">
        <span class="h-1.5 w-1.5 rounded-full bg-[#6fcf97]" aria-hidden="true" />
        BETA V0.9
      </span>
    </div>

    <!-- ============ Con formulario ============ -->
    <div v-if="conTarjeta" class="relative z-10 flex min-h-screen min-h-[100dvh] lg:items-center lg:justify-center lg:px-6 lg:py-10">
      <div class="flex w-full flex-col lg:max-w-[64rem]">
        <div
          class="flex min-h-screen min-h-[100dvh] flex-col text-gray-900 lg:grid lg:min-h-0 lg:grid-cols-[1.05fr_1fr] lg:overflow-hidden lg:rounded-[1.75rem] lg:bg-white lg:shadow-[0_40px_80px_-30px_rgba(0,0,0,0.65)]"
        >
          <!-- Escena: cabecera en el celular, mitad izquierda en escritorio -->
          <!-- En el celular es baja a propósito: el botón de Google tiene que verse sin desplazar. -->
          <div class="relative h-[12.25rem] flex-shrink-0 overflow-hidden bg-gradient-to-b from-[#04110a] via-[#0b2a1a] to-[#1B5E37] text-white sm:h-[16rem] lg:h-auto lg:min-h-[38rem]">
            <DestellosFondo />

            <!--
              Alcancía del celular: a la derecha, asomada sobre la ola. Por eso en el celular
              el logo y el saludo van alineados a la izquierda (centrados la pisarían).
            -->
            <EscenaAlcancia compacta class="absolute bottom-6 right-2 w-[8.5rem] sm:bottom-8 sm:right-6 sm:w-[11rem] lg:hidden" />

            <div class="relative z-10 flex flex-col items-start px-5 pt-[max(0.75rem,env(safe-area-inset-top,0px))] text-left lg:p-10">
              <RouterLink to="/" class="inline-flex min-h-[44px] items-center gap-2.5" aria-label="Natillerapp, ir al inicio">
                <img src="/favicon.svg" alt="" width="44" height="44" class="h-11 w-11" />
                <span class="font-display text-2xl font-extrabold tracking-[0.01em]">Natillerapp</span>
                <span class="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-bold tracking-[0.08em] text-white/85 lg:hidden">BETA V0.9</span>
              </RouterLink>

              <!-- Saludo del celular, como el «Hello. Create your account» de la referencia -->
              <p class="mt-1 font-display text-[1.45rem] font-light leading-tight lg:hidden">
                {{ saludo[0] }}<br /><span class="font-extrabold">{{ saludo[1] }}</span>
              </p>

              <div class="hidden lg:block">
                <p class="mt-8 text-xs font-bold tracking-[0.18em] text-[#9fd9b1]">AHORRO EN COMUNIDAD</p>
                <p class="mt-2 max-w-xs font-display text-4xl font-light leading-[1.1] tracking-tight">
                  Ahorra en grupo,<br /><span class="font-extrabold">crece en comunidad</span>
                </p>
                <!-- La misma alcancía de la portada; en el celular va la versión compacta, arriba. -->
                <EscenaAlcancia class="mx-auto mt-6 w-full max-w-[24rem]" />
              </div>
            </div>
          </div>

          <!--
            Formulario: hoja blanca que sube sobre la escena en el celular; mitad derecha en
            escritorio. `div` y no `main`: useBodyScrollLock y el scroll de la app buscan el
            primer <main>.
          -->
          <div
            class="relative z-10 flex flex-1 flex-col bg-white px-5 pb-[max(1.25rem,env(safe-area-inset-bottom,0px))] pt-4 sm:px-10 lg:mt-0 lg:justify-center lg:py-12 lg:pl-8 lg:pr-12"
          >
            <!--
              Ola del celular: la hoja sube sobre la escena con la misma curva que en
              escritorio separa escena y formulario. Baja 1 px dentro del blanco para que no
              quede costura de antialias.
            -->
            <svg
              class="pointer-events-none absolute inset-x-0 top-[calc(-2.75rem+1px)] h-11 w-full lg:hidden"
              viewBox="0 0 100 22"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path d="M0 23 V12 C 14 2, 28 1, 44 9 S 76 21, 100 6 V23 Z" fill="#fff" />
            </svg>
            <!--
              Ola blanca de escritorio. Vive en esta columna y se sale hacia la izquierda por
              encima de la escena: su borde recto queda 2 px dentro del blanco, así no hay
              costura de antialias entre la ola y el formulario.
            -->
            <svg
              class="pointer-events-none absolute inset-y-0 left-[calc(-7.5rem+2px)] hidden h-full w-[7.5rem] lg:block"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path d="M101 0 H62 C 22 14, 20 34, 52 50 S 78 86, 40 100 H101 Z" fill="#fff" />
            </svg>
            <div class="relative mx-auto w-full max-w-md lg:max-w-none">
              <router-view />
            </div>

            <!-- En el celular estos enlaces van dentro de la hoja; en escritorio, debajo de la tarjeta -->
            <nav aria-label="Más información" class="relative mt-4 flex flex-wrap justify-center gap-x-5 gap-y-1 text-sm lg:hidden">
              <RouterLink v-if="!enPwa" to="/" class="inline-flex min-h-[44px] items-center font-semibold text-[#1B5E37]">← Volver al inicio</RouterLink>
              <RouterLink :to="{ name: 'QueEsNatillerapp' }" class="inline-flex min-h-[44px] items-center font-semibold text-[#1B5E37]">¿Qué es Natillerapp?</RouterLink>
            </nav>
          </div>
        </div>

        <nav aria-label="Más información" class="mt-4 hidden flex-wrap justify-center gap-x-5 gap-y-1 text-sm lg:flex">
          <RouterLink v-if="!enPwa" to="/" class="inline-flex min-h-[44px] items-center font-semibold text-white/75 hover:text-white">← Volver al inicio</RouterLink>
          <RouterLink :to="{ name: 'QueEsNatillerapp' }" class="inline-flex min-h-[44px] items-center font-semibold text-white/75 hover:text-white">¿Qué es Natillerapp?</RouterLink>
        </nav>
      </div>
    </div>

    <!-- ============ Sin tarjeta: «Qué es Natillerapp» ============ -->
    <div
      v-else
      class="relative z-10 mx-auto max-w-6xl px-4 pb-[max(2rem,env(safe-area-inset-bottom,0px))] pt-[max(1.25rem,env(safe-area-inset-top,0px))] sm:px-6 lg:pt-8"
    >
      <RouterLink to="/" class="inline-flex min-h-[44px] items-center gap-2.5" aria-label="Natillerapp, ir al inicio">
        <img src="/favicon.svg" alt="" width="44" height="44" class="h-11 w-11" />
        <span class="font-display text-2xl font-extrabold tracking-[0.01em]">Natillerapp</span>
      </RouterLink>
      <div class="mt-6">
        <router-view />
      </div>
      <nav aria-label="Más información" class="mt-5 flex justify-center text-sm">
        <RouterLink v-if="!enPwa" to="/" class="inline-flex min-h-[44px] items-center font-semibold text-white/75 hover:text-white">← Volver al inicio</RouterLink>
      </nav>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { esModoStandalone } from '../composables/usePwaInstall'
import EscenaAlcancia from '../components/publico/EscenaAlcancia.vue'
import DestellosFondo from '../components/publico/DestellosFondo.vue'

const route = useRoute()
const conTarjeta = computed(() => route.name !== 'QueEsNatillerapp')

// En la PWA instalada «Volver al inicio» no lleva a ningún lado: «/» redirige al login.
const enPwa = esModoStandalone()

// Saludo de la cabecera en el celular, según la pantalla.
const SALUDOS = {
  Login: ['Hola de nuevo.', 'Entra a tu natillera'],
  Register: ['Hola.', 'Crea tu cuenta'],
  ResetPassword: ['Tranquilo.', 'Recuperemos tu acceso'],
  Welcome: ['Bienvenido.', 'Ya casi estás']
}
const saludo = computed(() => SALUDOS[route.name] || ['Hola.', 'Ahorra en grupo'])
</script>

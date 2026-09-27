<template>
  <!--
    Dirección que no existe. Mismo mundo visual que la portada (fondo verde noche con
    destellos) y dos salidas claras. Va con noindex (no tiene `meta.publico`).
  -->
  <div class="relative flex min-h-screen min-h-[100dvh] flex-col overflow-hidden bg-gradient-to-b from-[#04110a] via-[#0b2a1a] to-[#1B5E37] px-4 pb-[max(2rem,env(safe-area-inset-bottom,0px))] pt-[max(1.25rem,env(safe-area-inset-top,0px))] text-white sm:px-6">
    <DestellosFondo />

    <RouterLink to="/" class="relative z-10 mx-auto inline-flex min-h-[44px] touch-manipulation items-center gap-2.5 sm:mx-0" aria-label="Natillerapp, ir al inicio">
      <img src="/favicon.svg" alt="" width="40" height="40" class="h-10 w-10" />
      <span class="font-display text-xl font-extrabold tracking-[0.01em]">Natillerapp</span>
    </RouterLink>

    <main class="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center py-10 text-center">
      <p class="font-display text-7xl font-extrabold tracking-tight text-[#b9f0cc] sm:text-8xl">404</p>
      <h1 class="mt-4 font-display text-2xl font-extrabold sm:text-3xl">No encontramos esta página</h1>
      <p class="mt-3 text-base leading-relaxed text-white/75">
        Puede que el enlace esté incompleto o que la página ya no exista. Tu natillera y tus datos siguen donde estaban.
      </p>
      <div class="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
        <RouterLink
          :to="enPwa ? { name: 'Login' } : '/'"
          class="inline-flex min-h-[48px] touch-manipulation items-center justify-center rounded-full bg-white px-7 text-base font-bold text-[#1B5E37] hover:bg-[#E8F5E9]"
        >
          {{ enPwa ? 'Ir a mi natillera' : 'Ir al inicio' }}
        </RouterLink>
        <RouterLink
          v-if="!enPwa"
          :to="{ name: 'Login' }"
          class="inline-flex min-h-[48px] touch-manipulation items-center justify-center rounded-full border border-white/30 px-7 text-base font-bold text-white hover:bg-white/10"
        >
          Iniciar sesión
        </RouterLink>
      </div>
    </main>
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router'
import { esModoStandalone } from '../../composables/usePwaInstall'
import DestellosFondo from '../../components/publico/DestellosFondo.vue'

// En la PWA instalada la portada no existe («/» manda al login): una sola salida, al login,
// que con sesión sigue sola a la última natillera.
const enPwa = esModoStandalone()
</script>

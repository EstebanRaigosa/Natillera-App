<template>
  <!--
    Cabecera de las páginas públicas (portada y guía). Va dentro del hero de cada página,
    sobre su fondo. Fuera de la portada, las secciones se enlazan como «/#seccion».
  -->
  <header class="relative z-20 pt-[env(safe-area-inset-top)]">
    <div class="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
      <RouterLink to="/" class="flex min-h-[44px] touch-manipulation items-center gap-2" aria-label="Natillerapp, inicio">
        <img src="/favicon.svg" alt="" width="32" height="32" class="h-8 w-8" />
        <span class="font-display text-lg font-extrabold tracking-[0.02em] text-white">Natillerapp</span>
      </RouterLink>
      <nav aria-label="Principal" class="flex items-center gap-1">
        <a :href="`${base}#funciones`" class="hidden min-h-[44px] items-center px-3 text-sm font-semibold text-white/80 hover:text-white md:inline-flex">Funciones</a>
        <a :href="`${base}#como-funciona`" class="hidden min-h-[44px] items-center px-3 text-sm font-semibold text-white/80 hover:text-white md:inline-flex">Cómo funciona</a>
        <RouterLink
          to="/que-es-una-natillera"
          class="hidden min-h-[44px] items-center px-3 text-sm font-semibold text-white/80 hover:text-white lg:inline-flex"
          active-class="!text-white"
        >Guía</RouterLink>
        <a :href="`${base}#preguntas`" class="hidden min-h-[44px] items-center px-3 text-sm font-semibold text-white/80 hover:text-white md:inline-flex">Preguntas</a>
        <RouterLink to="/auth/login" class="inline-flex min-h-[44px] touch-manipulation items-center px-3 text-sm font-bold text-white hover:text-[#b9e4c6]">
          Iniciar sesión
        </RouterLink>
        <RouterLink
          to="/auth/register"
          class="hidden min-h-[44px] touch-manipulation items-center rounded-full border border-white/25 bg-white/10 px-4 text-sm font-bold text-white hover:bg-white/20 sm:inline-flex"
        >
          Crear mi natillera
        </RouterLink>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

const props = defineProps({
  /** En la portada las secciones están en la misma página; en las demás, en «/». */
  enPortada: { type: Boolean, default: false }
})

const base = computed(() => (props.enPortada ? '' : '/'))
</script>

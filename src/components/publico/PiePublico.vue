<template>
  <!-- Pie de las páginas públicas (portada y guía). Fuera de la portada, las secciones se enlazan como «/#seccion». -->
  <footer class="relative overflow-hidden bg-gradient-to-b from-[#07170f] via-[#0b2a1a] to-[#1B5E37]">
    <div class="relative z-10 mx-auto grid max-w-6xl gap-8 px-4 pb-10 pt-4 sm:grid-cols-[1.2fr_1fr_1fr] sm:px-6">
      <div>
        <p class="flex items-center gap-2">
          <img src="/favicon.svg" alt="" width="28" height="28" class="h-7 w-7" />
          <span class="font-display text-lg font-extrabold">Natillerapp</span>
        </p>
        <p class="mt-2 text-sm text-white/60">Ahorro colectivo en orden.</p>
      </div>
      <nav aria-label="La app">
        <p class="text-xs font-bold tracking-[0.16em] text-[#9fd9b1]">LA APP</p>
        <ul class="mt-2 text-sm">
          <li><a :href="`${base}#funciones`" class="inline-flex min-h-[44px] items-center text-white/75 hover:text-white">Funciones</a></li>
          <li><a :href="`${base}#como-funciona`" class="inline-flex min-h-[44px] items-center text-white/75 hover:text-white">Cómo funciona</a></li>
          <li><a :href="`${base}#soporte`" class="inline-flex min-h-[44px] items-center text-white/75 hover:text-white">Soporte</a></li>
          <li><a :href="`${base}#preguntas`" class="inline-flex min-h-[44px] items-center text-white/75 hover:text-white">Preguntas frecuentes</a></li>
        </ul>
      </nav>
      <nav aria-label="Cuenta">
        <p class="text-xs font-bold tracking-[0.16em] text-[#9fd9b1]">TU CUENTA</p>
        <ul class="mt-2 text-sm">
          <li><RouterLink to="/auth/register" class="inline-flex min-h-[44px] items-center text-white/75 hover:text-white">Crear cuenta</RouterLink></li>
          <li><RouterLink to="/auth/login" class="inline-flex min-h-[44px] items-center text-white/75 hover:text-white">Iniciar sesión</RouterLink></li>
          <li><RouterLink to="/que-es-una-natillera" class="inline-flex min-h-[44px] items-center text-white/75 hover:text-white">Qué es una natillera</RouterLink></li>
          <li><RouterLink to="/privacidad" class="inline-flex min-h-[44px] items-center text-white/75 hover:text-white">Tratamiento de datos</RouterLink></li>
          <li><RouterLink to="/terminos" class="inline-flex min-h-[44px] items-center text-white/75 hover:text-white">Términos y condiciones</RouterLink></li>
        </ul>
      </nav>
    </div>

    <p class="relative bg-[#07170f] pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-2 text-center text-xs text-white/45">
      © {{ ANIO }} Natillerapp
    </p>
  </footer>
</template>

<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

const props = defineProps({
  /** En la portada las secciones están en la misma página; en las demás, en «/». */
  enPortada: { type: Boolean, default: false }
})

const base = computed(() => (props.enPortada ? '' : '/'))

// Se fija al pre-renderizar y el navegador lo recalcula igual al montar.
const ANIO = new Date().getFullYear()
</script>

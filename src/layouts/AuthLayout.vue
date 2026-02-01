<template>
  <div class="h-screen flex flex-col items-stretch justify-start p-0 relative overflow-hidden">
    <!-- Fondo con degradado bonito para desktop usando colores de identidad -->
    <div class="absolute inset-0 bg-gradient-to-br from-natillera-900 via-emerald-800 to-teal-900 lg:bg-gradient-to-r lg:from-teal-700 lg:via-emerald-600 lg:to-natillera-700">
      <!-- Capas de degradado adicionales para profundidad sin animación -->
      <div class="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-800/30 to-transparent lg:from-teal-600/40 lg:via-transparent lg:to-natillera-600/40"></div>
      <div class="absolute inset-0 bg-gradient-to-l from-natillera-800/20 via-transparent to-teal-800/20 lg:from-natillera-500/30 lg:via-transparent lg:to-teal-500/30"></div>
      <!-- Degradado radial para efecto de luz -->
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(16,185,129,0.4),transparent_50%)] lg:bg-[radial-gradient(circle_at_20%_30%,rgba(34,197,94,0.5),transparent_60%)]"></div>
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(20,184,166,0.4),transparent_50%)] lg:bg-[radial-gradient(circle_at_80%_70%,rgba(22,163,74,0.5),transparent_60%)]"></div>
      <!-- Formas estáticas desenfocadas para textura -->
      <div class="absolute top-0 left-0 w-96 h-96 bg-teal-400/25 rounded-full blur-3xl lg:bg-teal-300/40 lg:w-[600px] lg:h-[600px] lg:-top-32 lg:-left-32"></div>
      <div class="absolute bottom-0 right-0 w-96 h-96 bg-emerald-400/25 rounded-full blur-3xl lg:bg-emerald-300/40 lg:w-[700px] lg:h-[700px] lg:-bottom-40 lg:-right-40"></div>
      <div class="absolute top-1/2 left-1/3 w-96 h-96 bg-natillera-400/20 rounded-full blur-3xl lg:bg-natillera-300/35 lg:w-[500px] lg:h-[500px] transform -translate-x-1/2 -translate-y-1/2"></div>
    </div>

    <!-- Contenedor con scroll: contenido empieza arriba para que siempre se vea la parte superior -->
    <div class="relative z-10 w-full flex-1 min-h-0 flex flex-col overflow-y-auto overflow-x-hidden py-4 p-2 sm:p-4 lg:p-7">
      <!-- Contenido del formulario -->
      <div class="w-full max-w-md mx-auto flex-shrink-0 px-1">
        <!-- Logo y título -->
        <div class="mb-3 sm:mb-3 lg:mb-3 animate-fade-in-up text-center">
          <div class="flex items-center justify-center gap-2.5 sm:gap-3 mb-1.5">
            <div class="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-natillera-400 via-emerald-400 to-teal-400 rounded-xl sm:rounded-2xl shadow-2xl shadow-emerald-500/50 ring-4 ring-white/30 backdrop-blur-sm">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 sm:h-8 sm:w-8 text-white drop-shadow-lg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h1 class="text-2xl sm:text-3xl lg:text-4xl font-display font-bold drop-shadow-[0_4px_12px_rgba(0,0,0,0.4)]" style="text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5), 0 0 20px rgba(16, 185, 129, 0.3);">
              <AppBrand class="text-white" />
            </h1>
          </div>
          <p class="text-white/90 text-xs sm:text-sm drop-shadow-[0_2px_6px_rgba(0,0,0,0.3)] font-medium">Plataforma y aplicación para gestionar tu natillera</p>
        </div>

        <!-- Formulario -->
        <div class="animate-fade-in-up stagger-1">
          <router-view />
        </div>

        <!-- Footer -->
        <p class="text-center text-xs text-white/80 mt-3 sm:mt-3 animate-fade-in-up stagger-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
          App para tu natillera desde el celular o la computadora. Gestión transparente para tu comunidad 🌱
          <br />
          <RouterLink to="/auth/que-es-natillerapp" class="inline-block mt-1.5 text-white/90 hover:text-white underline underline-offset-2 transition-colors">¿Qué es Natillerapp?</RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import AppBrand from '../components/AppBrand.vue'
</script>


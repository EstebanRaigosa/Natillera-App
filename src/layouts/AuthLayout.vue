<template>
  <div class="h-screen flex items-center sm:items-center justify-start sm:justify-center p-0 relative overflow-hidden bg-gradient-to-br from-natillera-900 via-natillera-800 to-emerald-900">
    <!-- Fondo verde sólido para móvil (sin animaciones) -->
    <div class="lg:hidden absolute inset-0 bg-gradient-to-br from-natillera-700 via-emerald-700 to-teal-700"></div>
    
    <!-- Fondo estilizado con degradado para desktop (sin animaciones) -->
    <div class="hidden lg:block absolute inset-0 overflow-hidden">
      <!-- Base degradado principal -->
      <div class="absolute inset-0 bg-gradient-to-br from-natillera-800 via-emerald-800 to-teal-800"></div>
      
      <!-- Degradado radial superior izquierdo -->
      <div class="absolute top-0 left-0 w-1/2 h-1/2 rounded-br-full" style="background: radial-gradient(circle at top left, rgba(16, 185, 129, 0.4), rgba(5, 150, 105, 0.2), transparent);"></div>
      
      <!-- Degradado radial inferior derecho -->
      <div class="absolute bottom-0 right-0 w-1/2 h-1/2 rounded-tl-full" style="background: radial-gradient(circle at bottom right, rgba(20, 184, 166, 0.4), rgba(13, 148, 136, 0.2), transparent);"></div>
      
      <!-- Degradado radial centro -->
      <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl" style="background: radial-gradient(circle, rgba(34, 197, 94, 0.3), rgba(22, 163, 74, 0.15), transparent);"></div>
      
      <!-- Formas geométricas estáticas desenfocadas -->
      <div class="absolute top-1/4 right-1/4 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl"></div>
      <div class="absolute bottom-1/4 left-1/4 w-80 h-80 bg-teal-500/20 rounded-full blur-3xl"></div>
      <div class="absolute top-3/4 right-1/3 w-72 h-72 bg-natillera-500/25 rounded-full blur-3xl"></div>
      
      <!-- Overlay de brillo superior -->
      <div class="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-emerald-400/20 via-emerald-500/10 to-transparent"></div>
      
      <!-- Overlay de brillo inferior -->
      <div class="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-teal-400/20 via-teal-500/10 to-transparent"></div>
      
      <!-- Efecto de luz lateral izquierda -->
      <div class="absolute top-0 bottom-0 left-0 w-1/3 bg-gradient-to-r from-natillera-600/15 via-transparent to-transparent"></div>
      
      <!-- Efecto de luz lateral derecha -->
      <div class="absolute top-0 bottom-0 right-0 w-1/3 bg-gradient-to-l from-teal-600/15 via-transparent to-transparent"></div>
      
      <!-- Patrón sutil de textura -->
      <div class="absolute inset-0 opacity-5" style="background-image: repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255, 255, 255, 0.1) 10px, rgba(255, 255, 255, 0.1) 20px);"></div>
    </div>

    <!-- Formulario centrado sobre el fondo -->
    <div class="relative z-10 w-full flex flex-col justify-start sm:justify-center min-h-screen py-4 sm:py-0 p-2 sm:p-4 lg:p-7 overflow-y-auto">
      <!-- Contenido del formulario -->
      <div class="w-full max-w-md mx-auto">
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
          <p class="text-white/90 text-xs sm:text-sm drop-shadow-[0_2px_6px_rgba(0,0,0,0.3)] font-medium">Ahorro comunitario digital</p>
        </div>

        <!-- Formulario -->
        <div class="animate-fade-in-up stagger-1">
          <router-view />
        </div>

        <!-- Footer -->
        <p class="text-center text-xs text-white/80 mt-3 sm:mt-3 animate-fade-in-up stagger-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
          Gestión transparente para tu comunidad 🌱
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import AppBrand from '../components/AppBrand.vue'
</script>


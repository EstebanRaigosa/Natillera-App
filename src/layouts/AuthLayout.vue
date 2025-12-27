<template>
  <div class="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
    <!-- Background decorativo -->
    <div class="absolute inset-0 -z-10">
      <div class="absolute top-0 left-0 w-96 h-96 bg-natillera-400/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div class="absolute bottom-0 right-0 w-96 h-96 bg-accent-400/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
      <div class="absolute top-1/2 left-1/2 w-64 h-64 bg-natillera-300/10 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2"></div>
    </div>

    <div class="w-full max-w-md">
      <!-- Logo y título -->
      <div class="text-center mb-8 animate-fade-in-up">
        <div class="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-natillera-500 to-natillera-700 rounded-2xl shadow-xl shadow-natillera-500/30 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h1 class="text-3xl font-display font-bold text-gray-800">Natillera</h1>
        <p class="text-gray-500 mt-2">Ahorro comunitario digital</p>
      </div>

      <!-- Contenido del formulario -->
      <div class="card animate-fade-in-up stagger-1">
        <router-view />
      </div>

      <!-- Footer -->
      <p class="text-center text-sm text-gray-400 mt-6 animate-fade-in-up stagger-2">
        Gestión transparente para tu comunidad 🌱
      </p>
    </div>
  </div>
</template>

<script setup>
</script>


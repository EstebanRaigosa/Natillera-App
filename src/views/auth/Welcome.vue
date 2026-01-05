<template>
  <div>
    <div class="flex flex-col items-center gap-6 mb-8">
      <!-- Icono de éxito animado -->
      <div class="relative">
        <div class="absolute inset-0 bg-natillera-400 rounded-full blur-xl opacity-50 animate-ping"></div>
        <div class="relative w-24 h-24 bg-gradient-to-br from-natillera-500 to-natillera-600 rounded-full flex items-center justify-center shadow-xl shadow-natillera-500/30">
          <svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>

      <!-- Título -->
      <div class="text-center">
        <h2 class="text-3xl font-display font-bold text-gray-800 mb-2">
          ¡Cuenta confirmada!
        </h2>
        <p class="text-lg text-gray-600">
          Tu correo electrónico ha sido verificado exitosamente
        </p>
      </div>
    </div>

    <!-- Mensaje de bienvenida -->
    <div class="bg-gradient-to-br from-natillera-50 to-emerald-50 rounded-xl p-6 mb-6 border border-natillera-200">
      <div class="flex items-start gap-4">
        <div class="flex-shrink-0">
          <div class="w-10 h-10 bg-natillera-500 rounded-full flex items-center justify-center">
            <span class="text-2xl">🌱</span>
          </div>
        </div>
        <div class="flex-1">
          <h3 class="font-semibold text-gray-800 mb-2">¡Bienvenido a Natillerapp!</h3>
          <p class="text-sm text-gray-600 leading-relaxed">
            Ya estás listo para comenzar a gestionar tus natilleras comunitarias. 
            Podrás crear grupos de ahorro, registrar socios, controlar cuotas y mucho más.
          </p>
        </div>
      </div>
    </div>

    <!-- Características destacadas -->
    <div class="space-y-3 mb-8">
      <div class="flex items-center gap-3 text-sm text-gray-700">
        <div class="flex-shrink-0 w-6 h-6 bg-natillera-100 rounded-full flex items-center justify-center">
          <svg class="w-4 h-4 text-natillera-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <span>Gestiona múltiples natilleras desde un solo lugar</span>
      </div>
      <div class="flex items-center gap-3 text-sm text-gray-700">
        <div class="flex-shrink-0 w-6 h-6 bg-natillera-100 rounded-full flex items-center justify-center">
          <svg class="w-4 h-4 text-natillera-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <span>Controla cuotas personalizadas por socio</span>
      </div>
      <div class="flex items-center gap-3 text-sm text-gray-700">
        <div class="flex-shrink-0 w-6 h-6 bg-natillera-100 rounded-full flex items-center justify-center">
          <svg class="w-4 h-4 text-natillera-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <span>Administra préstamos y actividades</span>
      </div>
      <div class="flex items-center gap-3 text-sm text-gray-700">
        <div class="flex-shrink-0 w-6 h-6 bg-natillera-100 rounded-full flex items-center justify-center">
          <svg class="w-4 h-4 text-natillera-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <span>Todo de forma gratuita y transparente</span>
      </div>
    </div>

    <!-- Botón de acción principal -->
    <button 
      @click="goToLogin"
      class="btn-primary w-full flex items-center justify-center gap-2 text-lg py-4"
    >
      <span>Continuar al inicio de sesión</span>
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
      </svg>
    </button>

    <!-- Información adicional -->
    <p class="mt-6 text-center text-xs text-gray-500">
      ¿Ya tienes una cuenta? 
      <router-link to="/auth/login" class="text-natillera-600 font-semibold hover:text-natillera-700">
        Inicia sesión aquí
      </router-link>
    </p>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function goToLogin() {
  router.push('/auth/login')
}
</script>

